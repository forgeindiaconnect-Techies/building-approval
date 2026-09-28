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

// Dynamic Brevo Configuration Helper (reads latest process.env / .env)
function getBrevoConfig() {
  // Re-read .env if needed to catch live updates
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...v] = trimmed.split('=');
          process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      });
    }
  } catch {}

  const rawApi = (process.env.BREVO_API_KEY || '').trim();
  const rawSmtp = (process.env.BREVO_SMTP_KEY || '').trim();
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'forgeindiaconnectfic@gmail.com').trim();
  const senderName = (process.env.BREVO_SENDER_NAME || 'Tamil Nadu Building Approval Portal').trim();
  const smtpLogin = (process.env.BREVO_SMTP_LOGIN || 'b5786a001@smtp-brevo.com').trim();

  // Smart resolution
  let apiKey = '';
  let smtpKey = '';

  if (rawApi.startsWith('xkeysib-')) {
    apiKey = rawApi;
  } else if (rawApi.startsWith('xsmtpsib-')) {
    smtpKey = rawApi;
  }

  if (rawSmtp.startsWith('xsmtpsib-')) {
    smtpKey = rawSmtp;
  } else if (rawSmtp.startsWith('xkeysib-')) {
    apiKey = rawSmtp;
  }

  // Fallback if key does not match prefix
  if (!apiKey && rawApi && !rawApi.startsWith('xsmtpsib-')) apiKey = rawApi;
  if (!smtpKey && rawSmtp && !rawSmtp.startsWith('xkeysib-')) smtpKey = rawSmtp;

  return {
    apiKey,
    smtpKey,
    senderEmail,
    senderName,
    smtpLogin,
    smtpHost: 'smtp-relay.brevo.com',
    smtpPort: 587
  };
}

// 1. Direct RFC-Compliant SMTP STARTTLS Client for Brevo
async function sendBrevoSmtpEmail({ toEmail, toName, subject, htmlContent }) {
  const net = await import('net');
  const tls = await import('tls');
  const config = getBrevoConfig();

  const smtpHost = config.smtpHost;
  const smtpPort = config.smtpPort;
  const smtpUser = config.smtpLogin;
  const smtpPass = config.smtpKey;
  const senderEmail = config.senderEmail;
  const senderName = config.senderName;

  if (!smtpPass) {
    throw new Error('BREVO_SMTP_KEY is not configured in .env (starts with xsmtpsib-...)');
  }

  console.log(`📡 [Brevo SMTP] Connecting to ${smtpHost}:${smtpPort} (User: ${smtpUser})...`);

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

// 2. Brevo REST API Client (Used via HTTPS api.brevo.com port 443)
async function sendBrevoRestEmail({ toEmail, toName, subject, htmlContent }) {
  const config = getBrevoConfig();
  const key = config.apiKey || config.smtpKey;
  if (!key) throw new Error('Brevo API/SMTP Key is missing in .env');

  console.log(`📡 [Brevo REST API] Sending email via HTTPS api.brevo.com to ${toEmail}...`);

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: { name: config.senderName || 'Tamil Nadu Building Approval Portal', email: config.senderEmail || 'forgeindiaconnectfic@gmail.com' },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject: subject || 'Building Approval Status Notification',
      htmlContent: htmlContent || '<p>Notification from Building Approval System</p>'
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': key,
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
            console.log(`✅ [Brevo REST API] Dispatched successfully:`, parsed);
            resolve({ success: true, mode: 'REST API (HTTPS)', ...parsed });
          } else {
            console.error(`❌ [Brevo REST API Error HTTP ${res.statusCode}]:`, parsed.message || data);
            reject(new Error(parsed.message || data || `Brevo REST error ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error(data || e.message));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ [Brevo REST API Request Error]:`, err.message);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Brevo REST API request timed out'));
    });
    req.write(payload);
    req.end();
  });
}

// 3. Unified Brevo Dispatcher (Auto-selects REST API over HTTPS, with SMTP Relay fallback)
async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }) {
  const config = getBrevoConfig();
  const key = config.apiKey || config.smtpKey;

  if (!key) {
    throw new Error('Neither BREVO_API_KEY nor BREVO_SMTP_KEY is configured in .env');
  }

  // Primary: Send via Brevo HTTPS REST API (Port 443 - never blocked by cloud hosts or firewalls)
  try {
    return await sendBrevoRestEmail({ toEmail, toName, subject, htmlContent });
  } catch (restErr) {
    console.warn('⚠️ Brevo REST API attempt note:', restErr.message, 'Trying SMTP Relay (port 587)...');
  }

  // Secondary Fallback: SMTP STARTTLS Socket Relay
  if (config.smtpKey) {
    try {
      return await sendBrevoSmtpEmail({ toEmail, toName, subject, htmlContent });
    } catch (smtpErr) {
      console.error('❌ Brevo SMTP Relay error:', smtpErr.message);
      throw smtpErr;
    }
  }

  throw new Error('Failed to dispatch email via Brevo');
}

// 4. Connection Checker for Brevo (SMTP and/or REST API)
async function checkBrevoConnection() {
  const config = getBrevoConfig();

  // Check REST API if configured
  if (config.apiKey) {
    try {
      const restResult = await new Promise((resolve) => {
        const options = {
          hostname: 'api.brevo.com',
          path: '/v3/account',
          method: 'GET',
          headers: {
            'api-key': config.apiKey,
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
                  mode: 'REST API (HTTPS)',
                  email: parsed.email,
                  companyName: parsed.companyName || parsed.firstName || 'Brevo Account',
                  message: 'Brevo REST API active and verified'
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
  if (config.smtpKey) {
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
              senderEmail: config.senderEmail,
              senderName: config.senderName,
              keyPrefix: `${config.smtpKey.slice(0, 10)}...${config.smtpKey.slice(-6)}`,
              message: 'Brevo SMTP Relay reachable on port 587'
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
function generateRegistrationEmailHtml({ applicantName, applicationId, location, buildingType, uploadUrl, trackingUrl, workerName, email }) {
  const year = new Date().getFullYear();
  const safeName = applicantName || 'Valued Citizen';
  const safeId = applicationId || 'BA-2026-PENDING';
  const safeLocation = location || 'Tamil Nadu District';
  const safeType = buildingType || 'Residential Building';
  const safeWorker = workerName || 'Single Window Online Portal';
  const safeEmail = email || '';
  const nowFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const frontendBase = process.env.VITE_FRONTEND_URL || 'https://building-approval-two.vercel.app';
  const safeUploadUrl = uploadUrl || `${frontendBase}/customer-upload/${safeId}`;
  const safeTrackingUrl = trackingUrl || `${frontendBase}/track`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Acknowledgment & Tracking Details — BuildApp</title>
  <style>
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 28px 12px; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 35px rgba(15, 42, 74, 0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0F2A4A 0%, #001f3f 60%, #1e3a8a 100%); color: #ffffff; padding: 36px 28px 30px; text-align: center; }
    .company-badge { display: inline-block; background: linear-gradient(90deg, #FF9933 0%, #ff7700 100%); color: #ffffff; font-weight: 800; font-size: 11px; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(255, 153, 51, 0.35); }
    .title { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.3px; color: #ffffff; line-height: 1.25; }
    .subtitle { margin: 8px 0 0 0; font-size: 13.5px; opacity: 0.92; color: #93c5fd; font-weight: 500; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 10px; }
    .lead { font-size: 14.5px; line-height: 1.65; color: #475569; margin-bottom: 24px; }
    .app-highlight-card { background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 2px solid #bfdbfe; border-radius: 14px; padding: 22px 24px; margin: 22px 0 28px; text-align: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05); }
    .app-card-label { font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; }
    .app-id { font-size: 26px; font-weight: 900; color: #0F2A4A; letter-spacing: 2px; font-family: 'Courier New', Courier, monospace; }
    .app-status-tag { display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-size: 11.5px; font-weight: 800; padding: 3px 12px; border-radius: 999px; margin-top: 8px; }
    .details-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 26px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; }
    .details-table td { padding: 12px 18px; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; }
    .details-table tr:last-child td { border-bottom: none; }
    .col-label { color: #64748b; font-weight: 600; width: 38%; background-color: #f8fafc; }
    .col-val { color: #0f172a; font-weight: 700; }
    .btn-container { text-align: center; margin: 30px 0 28px; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #0F2A4A 0%, #1e3a8a 100%); color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: 800; font-size: 14.5px; margin: 0 6px 12px 6px; box-shadow: 0 6px 16px rgba(15, 42, 74, 0.25); }
    .btn-secondary { display: inline-block; background: #eff6ff; color: #2563eb !important; text-decoration: none; border: 1.5px solid #bfdbfe; padding: 13px 28px; border-radius: 10px; font-weight: 800; font-size: 14.5px; margin: 0 6px 12px 6px; }
    .checklist-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px 22px; margin: 24px 0; }
    .checklist-title { margin: 0 0 10px 0; color: #166534; font-size: 14.5px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
    .checklist-box ul { margin: 0; padding-left: 20px; color: #15803d; font-size: 13px; line-height: 1.7; font-weight: 500; }
    .stages-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 18px 22px; margin: 22px 0; }
    .stages-title { margin: 0 0 10px 0; color: #6b21a8; font-size: 14px; font-weight: 800; }
    .stages-list { font-size: 12.5px; color: #581c87; line-height: 1.6; }
    .support-box { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px 20px; margin-top: 24px; font-size: 13px; color: #475569; }
    .footer { background: #0b1c30; padding: 26px 28px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Official Header -->
    <div class="header">
      <div class="company-badge">🏛️ Single Window Clearance System • DTCP</div>
      <h1 class="title">Tamil Nadu Building Approval Portal</h1>
      <p class="subtitle">Directorate of Town and Country Planning & Municipal Administration</p>
    </div>

    <div class="content">
      <!-- Greeting -->
      <h2 class="greeting">Dear ${safeName},</h2>
      <p class="lead">
        Warm greetings from <strong>BuildApp (ForgeIndiaConnect Techies)</strong>! We are pleased to inform you that your building plan clearance application has been <strong>successfully registered</strong> in our real-time single-window platform on <strong>${nowFormatted}</strong>.
      </p>

      <!-- Application Reference ID Card -->
      <div class="app-highlight-card">
        <div class="app-card-label">Official Application Reference Number</div>
        <div class="app-id">${safeId}</div>
        <div>
          <span class="app-status-tag">✓ Application Registered • Ready for Scrutiny</span>
        </div>
      </div>

      <!-- Application Details Table -->
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
          <td class="col-label">Site / District</td>
          <td class="col-val">${safeLocation}</td>
        </tr>
        ${safeEmail ? `
        <tr>
          <td class="col-label">Registered Email</td>
          <td class="col-val">${safeEmail}</td>
        </tr>` : ''}
        <tr>
          <td class="col-label">Processing Channel</td>
          <td class="col-val">${safeWorker}</td>
        </tr>
        <tr>
          <td class="col-label">Current Stage</td>
          <td class="col-val" style="color: #2563eb;">Stage 1: Registration Completed ➜ Stage 2: Scrutiny</td>
        </tr>
      </table>

      <!-- Action Buttons -->
      <div class="btn-container">
        <a href="${safeTrackingUrl}" class="btn-primary" target="_blank">🔍 Track Live Application Status</a>
        <a href="${safeUploadUrl}" class="btn-secondary" target="_blank">📤 Upload / Manage Documents</a>
      </div>

      <!-- Required Documents Checklist -->
      <div class="checklist-box">
        <h4 class="checklist-title">📋 Required Documentation Checklist:</h4>
        <ul>
          <li><strong>Registered Land Sale Deed:</strong> Clear copy of title ownership deed.</li>
          <li><strong>Patta / Chitta & Combined FMB Sketch:</strong> Revenue record proof.</li>
          <li><strong>Encumbrance Certificate (EC):</strong> Minimum 15 to 30 years non-encumbrance proof.</li>
          <li><strong>Proposed Building & Site Plan:</strong> Prepared and sealed by Registered Architect/Engineer.</li>
          <li><strong>Applicant Identity Proof:</strong> Aadhaar Card / Passport / Voter ID.</li>
          <li><strong>Property Tax Receipt:</strong> Latest paid vacant land / property tax receipt.</li>
        </ul>
      </div>

      <!-- 5-Stage Approval Workflow -->
      <div class="stages-box">
        <div class="stages-title">🔄 5-Stage Clearance & Approval Journey:</div>
        <div class="stages-list">
          <strong>1. Registration (Completed ✓)</strong> ➜ 
          <strong>2. Document Scrutiny & Plan Verification</strong> ➜ 
          <strong>3. Field Site Inspection & GPS Verification</strong> ➜ 
          <strong>4. Scrutiny Fee Assessment & Online Payment</strong> ➜ 
          <strong>5. Final Sanction Order & Digital QR Permit</strong>
        </div>
      </div>

      <!-- Support & Helpdesk -->
      <div class="support-box">
        <p style="margin: 0 0 6px 0; font-weight: 700; color: #0F2A4A;">📞 Need Help or Have Inquiries?</p>
        <p style="margin: 0 0 4px 0;">Our Single Window Support Desk is available Monday through Saturday (9:30 AM to 6:00 PM).</p>
        <p style="margin: 0;">
          <strong>Email:</strong> <a href="mailto:forgeindiaconnectfic@gmail.com" style="color: #2563eb;">forgeindiaconnectfic@gmail.com</a> | 
          <strong>Toll-Free:</strong> 1800-425-DTCP (+91 44 2852 1115)
        </p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
        Please quote your Application Reference ID <strong>${safeId}</strong> in all future communications.
      </p>
    </div>

    <!-- Official Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #e2e8f0;">🏛️ Directorate of Town and Country Planning (DTCP)</p>
      <p style="margin: 0 0 6px 0; color: #94a3b8;">Department of Housing and Urban Development • Government of Tamil Nadu</p>
      <p style="margin: 0 0 10px 0; color: #94a3b8;">Platform engineered by <strong style="color: #ffffff;">ForgeIndiaConnect Techies</strong></p>
      <p style="margin: 0; font-size: 11px; color: #64748b;">
        This is an automated notification from the Single Window Clearance Portal. Please do not reply directly if no longer needed.
      </p>
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

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:' + PORT}`);
  const pathname = parsedUrl.pathname;

  // 0. Static Generated Project Assets Endpoint
  if (req.method === 'GET' && pathname.startsWith('/api/static-asset/')) {
    const assetKey = pathname.replace('/api/static-asset/', '').trim();
    const assetMap = {
      'hero': 'architects_team_showcase_1790328671629.jpg',
      'architects-team': 'architects_team_showcase_1790328671629.jpg',
      'blueprint': 'blueprint_hardhat_desk_1790325552811.jpg',
      'step1': 'step1_digital_submission_1790326067878.jpg',
      'step2': 'step2_plan_scrutiny_1790326093035.jpg',
      'step3': 'document_verification_approve_reject_1790330041197.jpg',
      'approve-reject': 'document_verification_approve_reject_1790330041197.jpg',
      'step4': 'step3_field_inspection_1790326118418.jpg',
      'step5': 'final_approval_certificate_female_worker_1790330753464.jpg',
      'certificate': 'final_approval_certificate_female_worker_1790330753464.jpg',
    };
    const filename = assetMap[assetKey] || assetKey;
    const brainDir = 'C:\\Users\\Forgeindiaconnect\\.gemini\\antigravity-ide\\brain\\bf747eb1-7f81-4788-840f-4e6be4b5c679';
    const filePath = path.join(brainDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        });
        return res.end(fileBuffer);
      } catch (err) {
        console.error('Error serving asset:', err);
      }
    }
  }

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
        const clientOrigin = req.headers.origin || process.env.VITE_FRONTEND_URL || 'https://building-approval-two.vercel.app';
        const finalUploadUrl = uploadUrl || `${clientOrigin}/customer-upload/${safeId}`;
        const finalTrackingUrl = trackingUrl || `${clientOrigin}/track`;

        const html = generateRegistrationEmailHtml({
          applicantName: safeName,
          applicationId: safeId,
          location,
          buildingType,
          workerName,
          uploadUrl: finalUploadUrl,
          trackingUrl: finalTrackingUrl,
          email: targetEmail
        });

        console.log(`📧 [Brevo] Dispatching real-time registration email to: ${targetEmail} (App: ${safeId})...`);

        const response = await sendBrevoEmail({
          toEmail: targetEmail,
          toName: safeName,
          subject: `🏛️ Application Acknowledgment: ${safeId} — BuildApp (DTCP Single Window Portal)`,
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
        const config = getBrevoConfig();
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
            <p style="font-size: 12px; color: #64748b;">Delivered in real-time via Brevo (${config.senderEmail})</p>
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

  // 8b. DELETE single application by ID
  if (req.method === 'DELETE' && pathname.startsWith('/api/applications/')) {
    const id = decodeURIComponent(pathname.replace('/api/applications/', '')).trim();
    if (isMongoConnected && ApplicationModel) {
      try {
        const deleted = await ApplicationModel.findOneAndDelete({ id: new RegExp(`^${id}$`, 'i') });
        if (deleted) {
          console.log(`🗑️ [MongoDB] Successfully deleted application: ${id}`);
          return sendJson(res, 200, { success: true, message: `Application ${id} deleted successfully`, id });
        }
        return sendJson(res, 404, { error: `Application ${id} not found in MongoDB` });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    } else {
      const db = getLocalDb();
      const initialLength = db.applications.length;
      db.applications = db.applications.filter(a => a.id.toUpperCase() !== id.toUpperCase());
      if (db.applications.length < initialLength) {
        saveLocalDb(db);
        console.log(`🗑️ [LocalDB] Successfully deleted application: ${id}`);
        return sendJson(res, 200, { success: true, message: `Application ${id} deleted successfully`, id });
      }
      return sendJson(res, 404, { error: `Application ${id} not found in local store` });
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
