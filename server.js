import http from 'http';
import https from 'https';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for Node.js SRV record lookup failures on Windows / local ISP DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Auto-load .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// Cloudinary connection checker
async function checkCloudinaryConnection() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return {
      connected: false,
      message: 'Cloudinary credentials missing or incomplete in .env'
    };
  }

  return new Promise((resolve) => {
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUDINARY_CLOUD_NAME}/ping`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      },
      timeout: 6000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            connected: true,
            status: 'ok',
            cloudName: CLOUDINARY_CLOUD_NAME,
            apiKey: CLOUDINARY_API_KEY ? `${CLOUDINARY_API_KEY.slice(0, 4)}...${CLOUDINARY_API_KEY.slice(-4)}` : '',
            message: 'Cloudinary connection verified and active'
          });
        } else {
          resolve({
            connected: false,
            statusCode: res.statusCode,
            cloudName: CLOUDINARY_CLOUD_NAME,
            error: data || `HTTP error ${res.statusCode}`
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        connected: false,
        cloudName: CLOUDINARY_CLOUD_NAME,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        connected: false,
        cloudName: CLOUDINARY_CLOUD_NAME,
        error: 'Cloudinary ping request timed out'
      });
    });

    req.end();
  });
}

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY || '';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'BuildPermit System';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'forgeindiaconnectfic@gmail.com';
const BREVO_SMTP_LOGIN = process.env.BREVO_SMTP_LOGIN || BREVO_SENDER_EMAIL;

// 1. Direct RFC-Compliant SMTP STARTTLS Client for Brevo
async function sendBrevoSmtpEmail({ toEmail, toName, subject, htmlContent }) {
  const net = await import('net');
  const tls = await import('tls');

  const smtpHost = 'smtp-relay.brevo.com';
  const smtpPort = 587;
  const smtpUser = BREVO_SMTP_LOGIN;
  const smtpPass = BREVO_SMTP_KEY;
  const senderEmail = BREVO_SENDER_EMAIL;
  const senderName = BREVO_SENDER_NAME;

  if (!smtpPass) {
    throw new Error('BREVO_SMTP_KEY is not configured in .env');
  }

  return new Promise((resolve, reject) => {
    let step = 0;
    let currentSocket = null;
    let buffer = '';
    let isDone = false;

    const socket = net.createConnection(smtpPort, smtpHost);
    currentSocket = socket;
    socket.setTimeout(15000);

    const cleanup = () => {
      isDone = true;
      try {
        if (currentSocket && !currentSocket.destroyed) {
          currentSocket.destroy();
        }
      } catch {}
    };

    const sendCmd = (cmd) => {
      if (currentSocket && !currentSocket.destroyed) {
        currentSocket.write(cmd + '\r\n');
      }
    };

    const handleData = (chunk) => {
      if (isDone) return;
      buffer += chunk.toString();
      const lines = buffer.split('\r\n');
      buffer = lines.pop(); // Keep unfinished tail

      for (const line of lines) {
        if (!line.trim()) continue;
        const code = parseInt(line.slice(0, 3), 10);
        const isLastLineOfReply = line.charAt(3) === ' ' || line.length === 3;

        if (!isLastLineOfReply) continue; // Skip intermediate 250-... multiline responses

        if (step === 0 && code === 220) {
          step = 1;
          sendCmd('EHLO localhost');
        } else if (step === 1 && code === 250) {
          step = 2;
          sendCmd('STARTTLS');
        } else if (step === 2 && code === 220) {
          // Upgrade socket to TLS
          step = 3;
          socket.removeAllListeners('data');
          socket.removeAllListeners('error');
          socket.removeAllListeners('timeout');

          const secureSocket = tls.connect({
            socket: socket,
            host: smtpHost,
            rejectUnauthorized: false
          }, () => {
            currentSocket = secureSocket;
            sendCmd('EHLO localhost');
          });

          currentSocket = secureSocket;
          secureSocket.setTimeout(15000);

          secureSocket.on('data', handleData);
          secureSocket.on('error', (err) => {
            cleanup();
            reject(new Error(`Brevo SMTP TLS Error: ${err.message}`));
          });
          secureSocket.on('timeout', () => {
            cleanup();
            reject(new Error('Brevo SMTP TLS Socket Timed Out'));
          });
        } else if (step === 3 && code === 250) {
          step = 4;
          sendCmd('AUTH LOGIN');
        } else if (step === 4 && code === 334) {
          step = 5;
          sendCmd(Buffer.from(smtpUser).toString('base64'));
        } else if (step === 5 && code === 334) {
          step = 6;
          sendCmd(Buffer.from(smtpPass).toString('base64'));
        } else if (step === 6 && code === 235) {
          step = 7;
          sendCmd(`MAIL FROM:<${senderEmail}>`);
        } else if (step === 7 && code === 250) {
          step = 8;
          sendCmd(`RCPT TO:<${toEmail}>`);
        } else if (step === 8 && code === 250) {
          step = 9;
          sendCmd('DATA');
        } else if (step === 9 && code === 354) {
          step = 10;
          const safeSubject = `=?UTF-8?B?${Buffer.from(subject || 'Notification').toString('base64')}?=`;
          const msgId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@buildingapproval.gov.in>`;
          const emailMessage = [
            `From: "${senderName}" <${senderEmail}>`,
            `To: "${toName || toEmail}" <${toEmail}>`,
            `Subject: ${safeSubject}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            `Date: ${new Date().toUTCString()}`,
            `Message-ID: ${msgId}`,
            '',
            Buffer.from(htmlContent || '').toString('base64'),
            '.',
            ''
          ].join('\r\n');

          currentSocket.write(emailMessage);
        } else if (step === 10 && code === 250) {
          step = 11;
          sendCmd('QUIT');
          cleanup();
          resolve({
            success: true,
            mode: 'SMTP Relay',
            response: line,
            to: toEmail,
            timestamp: new Date().toISOString()
          });
        } else if (code >= 400) {
          cleanup();
          reject(new Error(`Brevo SMTP Error [Code ${code}]: ${line}`));
        }
      }
    };

    socket.on('data', handleData);
    socket.on('error', (err) => {
      cleanup();
      reject(new Error(`Brevo SMTP Socket Error: ${err.message}`));
    });
    socket.on('timeout', () => {
      cleanup();
      reject(new Error('Brevo SMTP Socket Connection Timed Out'));
    });
  });
}

// 2. Brevo REST API Client (Used when BREVO_API_KEY is configured)
async function sendBrevoRestEmail({ toEmail, toName, subject, htmlContent }) {
  if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY is not configured in .env');

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject: subject || 'Building Approval Status Notification',
      htmlContent: htmlContent || '<p>Notification from Building Approval System</p>'
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, mode: 'REST API', ...parsed });
          } else {
            reject(new Error(parsed.message || data || `Brevo REST error ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error(data || e.message));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Brevo REST API request timed out'));
    });
    req.write(payload);
    req.end();
  });
}

// 3. Unified Brevo Dispatcher (Auto-selects REST API or SMTP Key)
async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }) {
  if (BREVO_API_KEY && BREVO_API_KEY.startsWith('xkeysib-')) {
    try {
      return await sendBrevoRestEmail({ toEmail, toName, subject, htmlContent });
    } catch (err) {
      if (BREVO_SMTP_KEY) {
        console.warn('⚠️ Brevo REST API failed, falling back to Brevo SMTP Relay:', err.message);
        return await sendBrevoSmtpEmail({ toEmail, toName, subject, htmlContent });
      }
      throw err;
    }
  }

  if (BREVO_SMTP_KEY) {
    return await sendBrevoSmtpEmail({ toEmail, toName, subject, htmlContent });
  }

  if (BREVO_API_KEY) {
    return await sendBrevoRestEmail({ toEmail, toName, subject, htmlContent });
  }

  throw new Error('Neither BREVO_API_KEY nor BREVO_SMTP_KEY is configured in .env');
}

// 4. Connection Checker for Brevo (SMTP and/or REST API)
async function checkBrevoConnection() {
  // Check REST API if configured
  if (BREVO_API_KEY && BREVO_API_KEY.startsWith('xkeysib-')) {
    try {
      const restResult = await new Promise((resolve) => {
        const options = {
          hostname: 'api.brevo.com',
          path: '/v3/account',
          method: 'GET',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode === 200) {
                resolve({
                  connected: true,
                  status: 'ok',
                  mode: 'REST API',
                  email: parsed.email,
                  companyName: parsed.companyName || parsed.firstName || 'Brevo Account',
                  message: 'Brevo API key verified successfully'
                });
              } else {
                resolve({ connected: false, error: parsed.message || data });
              }
            } catch {
              resolve({ connected: res.statusCode === 200, message: data });
            }
          });
        });

        req.on('error', (err) => resolve({ connected: false, error: err.message }));
        req.on('timeout', () => {
          req.destroy();
          resolve({ connected: false, error: 'Brevo REST timeout' });
        });
        req.end();
      });

      if (restResult.connected) return restResult;
    } catch {}
  }

  // Check SMTP Relay
  if (BREVO_SMTP_KEY) {
    return new Promise(async (resolve) => {
      try {
        const net = await import('net');
        const socket = net.createConnection(587, 'smtp-relay.brevo.com');
        socket.setTimeout(6000);

        socket.on('data', (data) => {
          const msg = data.toString();
          socket.destroy();
          if (msg.includes('220')) {
            resolve({
              connected: true,
              status: 'ok',
              mode: 'SMTP Relay',
              server: 'smtp-relay.brevo.com:587',
              senderEmail: BREVO_SENDER_EMAIL,
              senderName: BREVO_SENDER_NAME,
              keyPrefix: `${BREVO_SMTP_KEY.slice(0, 10)}...${BREVO_SMTP_KEY.slice(-6)}`,
              message: 'Brevo SMTP Relay active and reachable on port 587'
            });
          } else {
            resolve({ connected: false, error: msg });
          }
        });

        socket.on('error', (err) => resolve({ connected: false, error: err.message }));
        socket.on('timeout', () => {
          socket.destroy();
          resolve({ connected: false, error: 'SMTP connection timed out' });
        });
      } catch (e) {
        resolve({ connected: false, error: e.message });
      }
    });
  }

  return {
    connected: false,
    message: 'Neither BREVO_API_KEY nor BREVO_SMTP_KEY is configured in .env'
  };
}

// 5. Official HTML Email Template for Real-Time Customer Registration
function generateRegistrationEmailHtml({ applicantName, applicationId, location, buildingType, uploadUrl, trackingUrl, workerName }) {
  const year = new Date().getFullYear();
  const safeName = applicantName || 'Citizen';
  const safeId = applicationId || 'BA-2026-PENDING';
  const safeLocation = location || 'Tamil Nadu District';
  const safeType = buildingType || 'Residential';
  const safeWorker = workerName || 'Authorized Field Worker';
  const safeUploadUrl = uploadUrl || `http://localhost:5173/customer-upload/${safeId}`;
  const safeTrackingUrl = trackingUrl || `http://localhost:5173/track`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Building Approval Registration Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #1e293b; }
    .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #003366 0%, #001f3f 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .gov-badge { display: inline-block; background: #FF9933; color: #ffffff; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.75px; margin-bottom: 12px; }
    .title { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.2px; color: #ffffff; }
    .subtitle { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; color: #93c5fd; }
    .content { padding: 28px 26px; }
    .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .lead { font-size: 14.5px; line-height: 1.6; color: #475569; margin-bottom: 22px; }
    .app-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px 20px; margin: 20px 0 24px; text-align: center; }
    .app-card-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .app-id { font-size: 24px; font-weight: 900; color: #003366; letter-spacing: 1.5px; font-family: monospace; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }
    .details-table td { padding: 11px 16px; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; }
    .details-table tr:last-child td { border-bottom: none; }
    .col-label { color: #64748b; font-weight: 600; width: 40%; }
    .col-val { color: #0f172a; font-weight: 700; }
    .btn-group { text-align: center; margin: 28px 0 24px; }
    .btn-primary { display: inline-block; background: #003366; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0, 51, 102, 0.25); }
    .btn-secondary { display: block; width: fit-content; margin: 0 auto; color: #003366 !important; text-decoration: underline; font-weight: 600; font-size: 13px; }
    .checklist-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px 20px; margin: 24px 0; }
    .checklist-title { margin: 0 0 10px 0; color: #166534; font-size: 14px; font-weight: 700; }
    .checklist-box ul { margin: 0; padding-left: 20px; color: #15803d; font-size: 13px; line-height: 1.65; }
    .stages-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .stages-title { margin: 0 0 8px 0; color: #1e40af; font-size: 13.5px; font-weight: 700; }
    .stages-box p { margin: 0; font-size: 12.5px; color: #1e3a8a; line-height: 1.5; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="gov-badge">🏛️ Single Window Clearance System</div>
      <h1 class="title">Tamil Nadu Building Plan Approval</h1>
      <p class="subtitle">Online Building Permit & Citizen Scrutiny Portal</p>
    </div>

    <div class="content">
      <h2 class="greeting">Dear ${safeName},</h2>
      <p class="lead">
        Thank you for choosing the Single Window Portal. Your building approval application has been <strong>successfully registered</strong> in our real-time portal.
      </p>

      <div class="app-card">
        <div class="app-card-label">Official Application ID</div>
        <div class="app-id">${safeId}</div>
      </div>

      <table class="details-table">
        <tr>
          <td class="col-label">Applicant Name</td>
          <td class="col-val">${safeName}</td>
        </tr>
        <tr>
          <td class="col-label">Building Category</td>
          <td class="col-val">${safeType}</td>
        </tr>
        <tr>
          <td class="col-label">Site / Location</td>
          <td class="col-val">${safeLocation}</td>
        </tr>
        <tr>
          <td class="col-label">Registered By</td>
          <td class="col-val">${safeWorker}</td>
        </tr>
        <tr>
          <td class="col-label">Status</td>
          <td class="col-val" style="color: #d97706;">⚡ Pending Document Uploads</td>
        </tr>
      </table>

      <div class="btn-group">
        <a href="${safeUploadUrl}" class="btn-primary">📤 Upload Your Documents Now</a>
        <a href="${safeTrackingUrl}" class="btn-secondary">🔍 Track Application Real-Time</a>
      </div>

      <div class="checklist-box">
        <h4 class="checklist-title">📋 Checklist of Documents to Upload:</h4>
        <ul>
          <li>Registered Land Sale Deed / Title Documents</li>
          <li>Patta / Chitta & Combined FMB Sketch</li>
          <li>Encumbrance Certificate (EC for last 15-30 years)</li>
          <li>Proposed Building & Site Plan (by Registered Architect / Engineer)</li>
          <li>Applicant ID Proof (Aadhaar / Passport / Voter ID)</li>
          <li>Latest Property / Vacant Land Tax Receipt</li>
        </ul>
      </div>

      <div class="stages-box">
        <div class="stages-title">🔄 5-Stage Approval Workflow:</div>
        <p>1. Registration ➜ 2. Document Scrutiny ➜ 3. Site Inspection ➜ 4. Scrutiny Fee ➜ 5. Final Permit Sanction & QR Certificate</p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
        Need assistance? Contact your field officer or reply directly to this notification. Please keep your Application ID <strong>${safeId}</strong> ready for all future communications.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">📧 Real-Time Delivery via Brevo Mailer Service</p>
      <p style="margin: 0 0 6px 0;">BuildPermit — Directorate of Town and Country Planning (DTCP)</p>
      <p style="margin: 0;">© ${year} Government of Tamil Nadu. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

let mongoose = null;
let ApplicationModel = null;
let isMongoConnected = false;

// 2. Connect to MongoDB Atlas
async function connectMongoDB() {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not defined in .env');
    return;
  }

  try {
    const mongooseModule = await import('mongoose');
    mongoose = mongooseModule.default || mongooseModule;

    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'building_approval_db'
    });

    isMongoConnected = true;
    console.log('✅ Connected successfully to MongoDB Atlas Database: building_approval_db');

    // Define Application Schema
    const applicationSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      applicantName: { type: String, required: true },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: 'Chennai District' },
      buildingType: { type: String, default: 'Residential' },
      buildingDetails: {
        totalArea: { type: String, default: '' },
        noOfFloors: { type: String, default: '' },
        estimatedCost: { type: String, default: '' }
      },
      documents: [{
        name: String,
        type: String,
        url: String,
        status: { type: String, default: 'pending' },
        uploadedAt: { type: Date, default: Date.now }
      }],
      status: { type: String, default: 'pending' },
      currentStage: { type: String, default: 'Documents Scrutiny' },
      submissionDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
      assignedWorker: {
        id: String,
        name: String,
        role: String
      },
      stages: [{
        name: String,
        status: String,
        date: String
      }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    ApplicationModel = mongoose.models.Application || mongoose.model('Application', applicationSchema);

    // Seed sample application if collection is empty
    const count = await ApplicationModel.countDocuments();
    if (count === 0) {
      await ApplicationModel.create([
        {
          id: 'BA-2026-00125',
          applicantName: 'Ravi Kumar',
          email: 'ravi.kumar@example.com',
          phone: '+91 98765 43210',
          location: 'Zone 4, Anna Nagar, Chennai',
          buildingType: 'Residential',
          buildingDetails: {
            totalArea: '2,400 sq.ft',
            noOfFloors: 'G+2',
            estimatedCost: '₹45,00,000'
          },
          status: 'in_progress',
          currentStage: 'Site Inspection',
          submissionDate: '2026-09-18',
          assignedWorker: {
            id: 'WRK-001',
            name: 'Suresh Raina',
            role: 'Field Inspector'
          },
          stages: [
            { name: 'Application Submitted', status: 'completed', date: '18 Sep 2026' },
            { name: 'Documents Verified', status: 'completed', date: '21 Sep 2026' },
            { name: 'Site Inspection', status: 'current', date: 'Scheduled' },
            { name: 'Final Approval', status: 'pending', date: 'Estimated 27 Sep 2026' }
          ]
        },
        {
          id: 'BA-2026-00126',
          applicantName: 'Priya Sundaram',
          email: 'priya.s@example.com',
          phone: '+91 98450 12345',
          location: 'Zone 2, T. Nagar, Chennai',
          buildingType: 'Commercial',
          buildingDetails: {
            totalArea: '5,800 sq.ft',
            noOfFloors: 'G+4',
            estimatedCost: '₹1,20,00,000'
          },
          status: 'approved',
          currentStage: 'Sanction Cleared',
          submissionDate: '2026-09-10',
          assignedWorker: {
            id: 'WRK-002',
            name: 'Anand Sharma',
            role: 'Town Planning Officer'
          },
          stages: [
            { name: 'Application Submitted', status: 'completed', date: '10 Sep 2026' },
            { name: 'Documents Verified', status: 'completed', date: '12 Sep 2026' },
            { name: 'Site Inspection', status: 'completed', date: '16 Sep 2026' },
            { name: 'Final Approval', status: 'completed', date: '20 Sep 2026' }
          ]
        }
      ]);
      console.log('🌱 Seeded initial building applications into MongoDB Atlas!');
    }
  } catch (err) {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
    console.log('ℹ️ Running in memory/fallback mode while MongoDB driver is being installed.');
  }
}

// 3. Fallback Local Data Store
const DATA_FILE = path.join(__dirname, 'server_data.json');
function getLocalDb() {
  if (!fs.existsSync(DATA_FILE)) return { applications: [], workers: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return { applications: [], workers: [] };
  }
}
function saveLocalDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Helper for CORS & JSON responses
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, data) {
  setCors(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 4. HTTP Server
const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // 1. Health Check Endpoint
  if (req.method === 'GET' && pathname === '/api/health') {
    const cloudCheck = await checkCloudinaryConnection();
    const brevoCheck = await checkBrevoConnection();
    return sendJson(res, 200, {
      status: 'ok',
      database: isMongoConnected ? 'MongoDB Atlas (Connected)' : 'Local JSON Store',
      mongoConnected: isMongoConnected,
      cloudinary: cloudCheck,
      brevo: brevoCheck,
      timestamp: new Date()
    });
  }

  // 2. Cloudinary Status / Verification Endpoint
  if (req.method === 'GET' && pathname === '/api/cloudinary/check') {
    const result = await checkCloudinaryConnection();
    return sendJson(res, result.connected ? 200 : 400, result);
  }

  // 3. Cloudinary Public Config Endpoint (for Frontend)
  if (req.method === 'GET' && pathname === '/api/cloudinary/config') {
    return sendJson(res, 200, {
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      isConfigured: !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
    });
  }

  // 4. Brevo Status / Verification Endpoint
  if (req.method === 'GET' && pathname === '/api/brevo/check') {
    const result = await checkBrevoConnection();
    return sendJson(res, result.connected ? 200 : 400, result);
  }

  // 5. Brevo Send Real-Time Customer Registration Email Endpoint
  if (req.method === 'POST' && pathname === '/api/brevo/send-registration-email') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const {
          email,
          toEmail,
          applicantName,
          applicationId,
          location,
          buildingType,
          workerName,
          uploadUrl,
          trackingUrl
        } = JSON.parse(body || '{}');

        const targetEmail = email || toEmail;
        if (!targetEmail) {
          return sendJson(res, 400, { error: 'Customer email address is required' });
        }

        const safeId = applicationId || `BA-2026-${Date.now().toString().slice(-5)}`;
        const safeName = applicantName || 'Valued Citizen';
        const clientOrigin = req.headers.origin || 'http://localhost:5173';
        const finalUploadUrl = uploadUrl || `${clientOrigin}/customer-upload/${safeId}`;
        const finalTrackingUrl = trackingUrl || `${clientOrigin}/track`;

        const html = generateRegistrationEmailHtml({
          applicantName: safeName,
          applicationId: safeId,
          location,
          buildingType,
          workerName,
          uploadUrl: finalUploadUrl,
          trackingUrl: finalTrackingUrl
        });

        console.log(`📧 [Brevo] Dispatching real-time registration email to: ${targetEmail} (App: ${safeId})...`);

        const response = await sendBrevoEmail({
          toEmail: targetEmail,
          toName: safeName,
          subject: `🏛️ Building Plan Application Registered: ${safeId} — Upload Documents`,
          htmlContent: html
        });

        console.log(`✅ [Brevo] Real-time email delivered successfully to ${targetEmail}!`);
        return sendJson(res, 200, {
          success: true,
          message: `Real-time registration email successfully delivered to ${targetEmail}`,
          applicationId: safeId,
          brevoResponse: response
        });
      } catch (err) {
        console.error(`❌ [Brevo] Failed to send registration email:`, err.message);
        return sendJson(res, 500, { error: 'Failed to send registration email: ' + err.message });
      }
    });
    return;
  }

  // 6. Brevo Send Generic / Test Email Endpoint
  if (req.method === 'POST' && (pathname === '/api/brevo/test-email' || pathname === '/api/brevo/send-email')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { toEmail, toName, subject, message, htmlContent } = JSON.parse(body || '{}');
        if (!toEmail) {
          return sendJson(res, 400, { error: 'Recipient email (toEmail) is required' });
        }
        const finalHtml = htmlContent || `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #003366; margin-top: 0;">🏢 Building Approval System Notification</h2>
            <p>Hello <strong>${toName || 'User'}</strong>,</p>
            <p>${message || 'This is a confirmation test email sent from your Brevo integration in the Building Approval backend.'}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Delivered in real-time via Brevo (${BREVO_SENDER_EMAIL})</p>
          </div>
        `;

        const response = await sendBrevoEmail({
          toEmail,
          toName: toName || 'Building Approval User',
          subject: subject || 'Building Approval System - Email Notification',
          htmlContent: finalHtml
        });

        return sendJson(res, 200, {
          success: true,
          message: `Email successfully dispatched in real-time to ${toEmail}`,
          brevoResponse: response
        });
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to send email: ' + err.message });
      }
    });
    return;
  }

  // 7. GET all applications (Admin / Citizen Tracking)
  if (req.method === 'GET' && pathname === '/api/applications') {
    if (isMongoConnected && ApplicationModel) {
      try {
        const apps = await ApplicationModel.find().sort({ createdAt: -1 });
        return sendJson(res, 200, apps);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    } else {
      const db = getLocalDb();
      return sendJson(res, 200, db.applications);
    }
  }

  // 8. GET single application by ID
  if (req.method === 'GET' && pathname.startsWith('/api/applications/')) {
    const id = pathname.replace('/api/applications/', '');
    if (isMongoConnected && ApplicationModel) {
      try {
        const app = await ApplicationModel.findOne({ id: new RegExp(`^${id}$`, 'i') });
        if (app) return sendJson(res, 200, app);
        return sendJson(res, 404, { error: 'Application not found in MongoDB' });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    } else {
      const db = getLocalDb();
      const app = db.applications.find(a => a.id.toUpperCase() === id.toUpperCase());
      if (app) return sendJson(res, 200, app);
      return sendJson(res, 404, { error: 'Application not found' });
    }
  }

  // 9. POST submit customer application (Stores in DB & triggers real-time Brevo email)
  if (req.method === 'POST' && pathname === '/api/applications') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const newApp = JSON.parse(body);
        const count = isMongoConnected && ApplicationModel ? await ApplicationModel.countDocuments() : getLocalDb().applications.length;
        const generatedId = `BA-${new Date().getFullYear()}-${String(count + 125).padStart(5, '0')}`;
        const appId = newApp.id || generatedId;

        const fullApp = {
          id: appId,
          applicantName: newApp.applicantName || 'Applicant',
          email: newApp.email || '',
          phone: newApp.phone || newApp.mobile || '',
          location: newApp.location || 'Chennai District',
          buildingType: newApp.buildingType || 'Residential',
          buildingDetails: newApp.buildingDetails || {},
          documents: newApp.documents || [],
          status: 'pending',
          currentStage: 'Documents Scrutiny',
          submissionDate: new Date().toISOString().split('T')[0],
          assignedWorker: newApp.assignedWorker || {
            name: newApp.workerName || newApp.workerId || 'Field Officer'
          },
          stages: [
            { name: 'Application Submitted', status: 'completed', date: new Date().toLocaleDateString() },
            { name: 'Documents Verified', status: 'current', date: 'In Review' },
            { name: 'Site Inspection', status: 'pending', date: 'Pending' },
            { name: 'Final Approval', status: 'pending', date: 'Pending' }
          ]
        };

        let savedApp = fullApp;
        if (isMongoConnected && ApplicationModel) {
          savedApp = await ApplicationModel.create(fullApp);
          console.log(`📥 [MongoDB] Stored new application: ${savedApp.id} for ${savedApp.applicantName}`);
        } else {
          const db = getLocalDb();
          db.applications.unshift(fullApp);
          saveLocalDb(db);
        }

        // Trigger real-time Brevo email if customer provided an email address
        let emailSent = false;
        let emailResult = null;
        if (fullApp.email && fullApp.email.includes('@')) {
          try {
            const clientOrigin = req.headers.origin || 'http://localhost:5173';
            const html = generateRegistrationEmailHtml({
              applicantName: fullApp.applicantName,
              applicationId: fullApp.id,
              location: fullApp.location,
              buildingType: fullApp.buildingType,
              workerName: newApp.workerName || newApp.workerId || 'Field Officer',
              uploadUrl: `${clientOrigin}/customer-upload/${fullApp.id}`,
              trackingUrl: `${clientOrigin}/track`
            });

            emailResult = await sendBrevoEmail({
              toEmail: fullApp.email,
              toName: fullApp.applicantName,
              subject: `🏛️ Building Plan Application Registered: ${fullApp.id} — Upload Documents`,
              htmlContent: html
            });
            emailSent = true;
            console.log(`📧 [Brevo] Auto-sent registration email to ${fullApp.email} for application ${fullApp.id}`);
          } catch (mailErr) {
            console.warn(`⚠️ [Brevo] Auto-email dispatch warning:`, mailErr.message);
            emailResult = { error: mailErr.message };
          }
        }

        return sendJson(res, 201, {
          ...savedApp.toObject ? savedApp.toObject() : savedApp,
          emailSent,
          emailResult
        });
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON body: ' + err.message });
      }
    });
    return;
  }

  // 5. Auth / Login
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, role } = JSON.parse(body);
        if (username) {
          return sendJson(res, 200, {
            token: 'jwt-auth-token-2026',
            user: { username, role: role || 'Admin' },
            message: 'Authentication successful'
          });
        }
        return sendJson(res, 401, { error: 'Invalid credentials' });
      } catch {
        return sendJson(res, 400, { error: 'Malformed request' });
      }
    });
    return;
  }

  // Fallback 404
  return sendJson(res, 404, { error: 'Endpoint not found' });
});

// Start Server and Connect DB
connectMongoDB().finally(async () => {
  const cloudStatus = await checkCloudinaryConnection();
  const brevoStatus = await checkBrevoConnection();
  
  server.listen(PORT, () => {
    console.log(`\n🚀 BuildPermit Backend Server is active on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔗 Database: ${isMongoConnected ? 'MongoDB Atlas (Connected)' : 'Fallback Local Data (server_data.json)'}`);
    console.log(`☁️ Cloudinary: ${cloudStatus.connected ? `Connected (${cloudStatus.cloudName})` : `Disabled / Error (${cloudStatus.message || cloudStatus.error})`}`);
    const brevoLabel = brevoStatus.connected 
      ? `Connected [${brevoStatus.mode}] (${brevoStatus.email || brevoStatus.server})` 
      : `Disabled / Error (${brevoStatus.message || brevoStatus.error})`;
    console.log(`📧 Brevo (Email): ${brevoLabel}`);
  });
});
