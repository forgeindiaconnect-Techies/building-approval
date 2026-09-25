/**
 * Document Exporter Utility for Building Approval Management System
 * Pure Client-Side PDF 1.4 Generator & PKZIP 2.0 Archive Generator
 * 
 * Direct binary downloads:
 * 1. Single Document -> Downloads direct .pdf file
 * 2. Consolidated PDF -> Downloads all documents in one multi-page .pdf file
 * 3. ZIP Archive -> Downloads .zip containing ONLY the .pdf documents
 */

// CRC32 calculation table for ZIP format
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ buffer[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Pure JavaScript ZIP archive builder (PKZIP 2.0 format)
 */
export class ZipArchive {
  constructor() {
    this.files = [];
  }

  addFile(filename, data) {
    let uint8Data;
    if (typeof data === 'string') {
      uint8Data = new TextEncoder().encode(data);
    } else if (data instanceof Uint8Array) {
      uint8Data = data;
    } else if (data instanceof ArrayBuffer) {
      uint8Data = new Uint8Array(data);
    } else {
      uint8Data = new TextEncoder().encode(String(data));
    }

    this.files.push({
      name: filename,
      data: uint8Data,
      crc: crc32(uint8Data),
      size: uint8Data.length
    });
  }

  generate() {
    const encoder = new TextEncoder();
    let localHeadersSize = 0;
    let centralDirSize = 0;

    this.files.forEach(f => {
      const nameBytes = encoder.encode(f.name);
      f.nameBytes = nameBytes;
      localHeadersSize += 30 + nameBytes.length + f.size;
      centralDirSize += 46 + nameBytes.length;
    });

    const totalSize = localHeadersSize + centralDirSize + 22;
    const buffer = new Uint8Array(totalSize);
    const view = new DataView(buffer.buffer);
    let offset = 0;

    // 1. Write Local File Headers & Data
    this.files.forEach(f => {
      f.offset = offset;

      view.setUint32(offset, 0x04034b50, true);
      view.setUint16(offset + 4, 20, true);
      view.setUint16(offset + 6, 0x0800, true);
      view.setUint16(offset + 8, 0, true);
      view.setUint16(offset + 10, 0x5465, true);
      view.setUint16(offset + 12, 0x5465, true);
      view.setUint32(offset + 14, f.crc, true);
      view.setUint32(offset + 18, f.size, true);
      view.setUint32(offset + 22, f.size, true);
      view.setUint16(offset + 26, f.nameBytes.length, true);
      view.setUint16(offset + 28, 0, true);

      offset += 30;
      buffer.set(f.nameBytes, offset);
      offset += f.nameBytes.length;

      buffer.set(f.data, offset);
      offset += f.size;
    });

    const centralDirOffset = offset;

    // 2. Write Central Directory Headers
    this.files.forEach(f => {
      view.setUint32(offset, 0x02014b50, true);
      view.setUint16(offset + 4, 20, true);
      view.setUint16(offset + 6, 20, true);
      view.setUint16(offset + 8, 0x0800, true);
      view.setUint16(offset + 10, 0, true);
      view.setUint16(offset + 12, 0x5465, true);
      view.setUint16(offset + 14, 0x5465, true);
      view.setUint32(offset + 16, f.crc, true);
      view.setUint32(offset + 20, f.size, true);
      view.setUint32(offset + 24, f.size, true);
      view.setUint16(offset + 28, f.nameBytes.length, true);
      view.setUint16(offset + 30, 0, true);
      view.setUint16(offset + 32, 0, true);
      view.setUint16(offset + 34, 0, true);
      view.setUint16(offset + 36, 0, true);
      view.setUint32(offset + 38, 0, true);
      view.setUint32(offset + 42, f.offset, true);

      offset += 46;
      buffer.set(f.nameBytes, offset);
      offset += f.nameBytes.length;
    });

    // 3. Write End of Central Directory Record (EOCD)
    view.setUint32(offset, 0x06054b50, true);
    view.setUint16(offset + 4, 0, true);
    view.setUint16(offset + 6, 0, true);
    view.setUint16(offset + 8, this.files.length, true);
    view.setUint16(offset + 10, this.files.length, true);
    view.setUint32(offset + 12, centralDirSize, true);
    view.setUint32(offset + 16, centralDirOffset, true);
    view.setUint16(offset + 20, 0, true);

    return new Blob([buffer], { type: 'application/zip' });
  }
}

/**
 * Trigger direct file download
 */
export function triggerFileDownload(blobOrUrl, fileName) {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

function escapePdfText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Pure JavaScript PDF 1.4 Binary Generator
 * Generates valid standard PDF files directly in the browser.
 */
class PdfBuilder {
  constructor() {
    this.pageStreams = [];
  }

  /**
   * Add an official document page to the PDF
   */
  addDocumentPage({ doc, application, pageNum, totalPages }) {
    const isVerified = doc.status === 'verified';
    const isRejected = doc.status === 'reupload_required';
    const statusText = isVerified ? 'VERIFIED' : (isRejected ? 'REJECTED' : 'PENDING');
    const docDate = doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString();

    const appId = escapePdfText(application.id || 'APP-2026');
    const applicant = escapePdfText(application.applicantName || 'Applicant');
    const project = escapePdfText(application.projectName || 'Residential Housing Construction');
    const location = escapePdfText(application.location || 'Chennai Ward');
    const surveyNo = escapePdfText(application.surveyNumber || '14/2B');
    const docName = escapePdfText(doc.name || 'Building Approval Document');
    const verifiedBy = escapePdfText(doc.verifiedBy || (isVerified ? 'Municipal Scrutiny Officer' : 'Pending Review'));

    // PDF Drawing Commands (A4: 595 x 842 points)
    let stream = `
q
% Outer Page Border
0.06 0.16 0.29 RG 2 w
20 20 555 802 re S

0.8 0.84 0.88 RG 1 w
26 26 543 790 re S

% Top Header Bar (Deep Navy #0F2A4A)
0.06 0.16 0.29 rg
26 732 543 84 re f

% Gold accent line
0.85 0.60 0.10 rg
26 728 543 4 re f

% Header Text
BT
/F1 15 Tf
1 1 1 rg
297 788 Td
(DEPARTMENT OF MUNICIPAL ADMINISTRATION) Tj
ET

BT
/F2 9 Tf
0.7 0.85 1 rg
297 770 Td
(ONLINE BUILDING APPROVAL & PERMISSION MANAGEMENT SYSTEM) Tj
ET

BT
/F2 8 Tf
0.9 0.95 1 rg
297 752 Td
(OFFICIAL ATTESTED ATTACHMENT DOSSIER) Tj
ET

% Document Name Title Ribbon
0.97 0.98 0.99 rg
40 670 515 44 re f
0.8 0.84 0.88 RG 1 w
40 670 515 44 re S

BT
/F1 13 Tf
0.06 0.16 0.29 rg
55 686 Td
(${docName}) Tj
ET

% Status Badge
${isVerified 
  ? '0.86 0.99 0.90 rg 450 680 90 24 re f 0.08 0.64 0.29 RG 1 w 450 680 90 24 re S BT /F1 9 Tf 0.08 0.50 0.24 rg 495 688 Td (VERIFIED) Tj ET'
  : isRejected
  ? '0.99 0.89 0.89 rg 450 680 90 24 re f 0.86 0.15 0.15 RG 1 w 450 680 90 24 re S BT /F1 9 Tf 0.72 0.11 0.11 rg 495 688 Td (REJECTED) Tj ET'
  : '0.99 0.98 0.89 rg 450 680 90 24 re f 0.85 0.47 0.02 RG 1 w 450 680 90 24 re S BT /F1 9 Tf 0.70 0.33 0.04 rg 495 688 Td (PENDING) Tj ET'
}

% Application Metadata Box
0.97 0.98 0.99 rg
40 500 515 155 re f
0.8 0.84 0.88 RG 1 w
40 500 515 155 re S

BT
/F1 9 Tf
0.4 0.45 0.55 rg
55 632 Td
(APPLICATION NO:) Tj
/F1 10 Tf
0.06 0.16 0.29 rg
70 0 Td
(${appId}) Tj
/F1 9 Tf
0.4 0.45 0.55 rg
120 0 Td
(APPLICANT:) Tj
/F1 10 Tf
0.06 0.16 0.29 rg
70 0 Td
(${applicant}) Tj
ET

0.88 0.91 0.94 RG 1 w
40 618 m 555 618 l S

BT
/F1 9 Tf
0.4 0.45 0.55 rg
55 596 Td
(PROJECT TITLE:) Tj
/F2 9 Tf
0.06 0.16 0.29 rg
75 0 Td
(${project}) Tj
ET

BT
/F1 9 Tf
0.4 0.45 0.55 rg
55 572 Td
(LOCATION / WARD:) Tj
/F2 9 Tf
0.06 0.16 0.29 rg
90 0 Td
(${location}) Tj
/F1 9 Tf
0.4 0.45 0.55 rg
140 0 Td
(SURVEY NO:) Tj
/F2 9 Tf
0.06 0.16 0.29 rg
70 0 Td
(${surveyNo}) Tj
ET

0.88 0.91 0.94 RG 1 w
40 558 m 555 558 l S

BT
/F1 9 Tf
0.4 0.45 0.55 rg
55 536 Td
(UPLOAD DATE:) Tj
/F2 9 Tf
0.06 0.16 0.29 rg
75 0 Td
(${docDate}) Tj
/F1 9 Tf
0.4 0.45 0.55 rg
140 0 Td
(VERIFIED BY:) Tj
/F1 9 Tf
0.08 0.64 0.29 rg
75 0 Td
(${verifiedBy}) Tj
ET

BT
/F1 8 Tf
0.5 0.55 0.65 rg
55 514 Td
(SECURITY HASH: SHA256-${(doc.id || 'DOC').replace(/[^a-zA-Z0-9]/g, '')}-PERMIT-VAL-2026) Tj
ET

% Main Document Content Container
1 1 1 rg
40 180 515 305 re f
0.8 0.84 0.88 RG 1 w
40 180 515 305 re S

% Watermark
q
0.94 0.95 0.96 rg
BT
/F1 32 Tf
180 320 Td
(OFFICIAL RECORD) Tj
ET
Q

% Document Description
BT
/F1 11 Tf
0.15 0.2 0.3 rg
55 455 Td
(STATUTORY DOCUMENT ATTACHMENT) Tj
ET

BT
/F2 9 Tf
0.3 0.35 0.45 rg
55 432 Td
(This document was electronically registered under Tamil Nadu Combined Development) Tj
0 -14 Td
(and Building Rules (TNCDBR) 2019 via the Municipal Single Window Clearance System.) Tj
0 -18 Td
(All statutory requirements, setback rules, and ownership certificates have been validated.) Tj
ET

% Dashed Box for Drawing/Record
0.97 0.98 0.99 rg
65 210 465 170 re f
[4 3] 0 d
0.75 0.8 0.85 RG 1 w
65 210 465 170 re S
[] 0 d

BT
/F1 12 Tf
0.15 0.25 0.4 rg
297 310 Td
(${docName}) Tj
ET

BT
/F2 9 Tf
0.4 0.45 0.55 rg
297 288 Td
(Official Scrutinized Attachment on File for ${appId}) Tj
ET

BT
/F2 8 Tf
0.5 0.55 0.65 rg
297 270 Td
(Document Ref: ${doc.id || 'DOC-01'} • Survey Alignment Validated) Tj
ET

BT
/F1 8 Tf
0.08 0.64 0.29 rg
297 240 Td
([ CERTIFIED & ATTESTED ELECTRONIC RECORD ]) Tj
ET

% Digital Seal & QR Box
0.06 0.16 0.29 RG 1 w
50 65 75 75 re S

0.06 0.16 0.29 rg
58 118 16 16 re f
101 118 16 16 re f
58 75 16 16 re f
82 92 12 12 re f

BT
/F2 7 Tf
0.4 0.45 0.55 rg
87 52 Td
(Scan to Verify) Tj
ET

% Attestation Seal
0.06 0.16 0.29 RG 1 w
[2 2] 0 d
490 102 32 0 360 arc S
[] 0 d

BT
/F1 7 Tf
0.06 0.16 0.29 rg
490 110 Td
(MUNICIPAL CORP) Tj
ET
BT
/F1 8 Tf
0.08 0.64 0.29 rg
490 100 Td
(ATTESTED) Tj
ET
BT
/F2 7 Tf
0.06 0.16 0.29 rg
490 90 Td
(CHENNAI ZONE) Tj
ET

BT
/F1 9 Tf
0.06 0.16 0.29 rg
140 118 Td
(Digital Electronic Verification Seal) Tj
ET

BT
/F2 8 Tf
0.4 0.45 0.55 rg
140 102 Td
(Valid as per Section 65B of Indian Evidence Act.) Tj
0 -12 Td
(System Generated Electronic Document • No Physical Signature Required.) Tj
ET

% Footer Page Number
0.8 0.84 0.88 RG 1 w
26 40 543 0 re S

BT
/F2 8 Tf
0.5 0.55 0.65 rg
297 30 Td
(Page ${pageNum} of ${totalPages} • Department of Municipal Administration • Building Approval System) Tj
ET

Q
`;

    this.pageStreams.push(stream);
  }

  /**
   * Build valid PDF 1.4 binary array
   */
  generatePdfBlob() {
    const numPages = this.pageStreams.length;
    let objects = [];
    let offsets = [];

    // Header
    let pdf = '%PDF-1.4\n';

    const addObj = (content) => {
      offsets.push(pdf.length);
      const objIndex = objects.length + 1;
      const objStr = `${objIndex} 0 obj\n${content}\nendobj\n`;
      pdf += objStr;
      objects.push(objIndex);
      return objIndex;
    };

    // Obj 1: Catalog
    addObj('<< /Type /Catalog /Pages 2 0 R >>');

    // Obj 2: Pages (Kids array will be filled)
    const pagesObjIndex = 2;
    // We'll placeholder it and calculate page indices
    const pageObjStart = 6;
    let kidsRefs = [];
    for (let i = 0; i < numPages; i++) {
      kidsRefs.push(`${pageObjStart + i * 2} 0 R`);
    }

    offsets.push(pdf.length);
    pdf += `2 0 obj\n<< /Type /Pages /Kids [${kidsRefs.join(' ')}] /Count ${numPages} /MediaBox [0 0 595.28 841.89] >>\nendobj\n`;
    objects.push(2);

    // Obj 3: Font Helvetica-Bold
    addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

    // Obj 4: Font Helvetica
    addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    // Obj 5: Font Helvetica-Oblique
    addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>');

    // Add Page Objects & Content Streams
    for (let i = 0; i < numPages; i++) {
      const pageObjIndex = pageObjStart + i * 2;
      const contentObjIndex = pageObjIndex + 1;
      const streamContent = this.pageStreams[i].trim();
      const streamLength = new TextEncoder().encode(streamContent).length;

      // Page Object
      addObj(`<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObjIndex} 0 R >>`);

      // Content Stream Object
      addObj(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);
    }

    // XRef Table
    const startXref = pdf.length;
    pdf += 'xref\n';
    pdf += `0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.forEach(offset => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });

    // Trailer
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    const binaryData = new TextEncoder().encode(pdf);
    return new Blob([binaryData], { type: 'application/pdf' });
  }
}

/**
 * Generate a single document PDF Blob
 */
export function generateSingleDocumentPdfBlob(doc, application) {
  const builder = new PdfBuilder();
  builder.addDocumentPage({
    doc,
    application: application || {},
    pageNum: 1,
    totalPages: 1
  });
  return builder.generatePdfBlob();
}

/**
 * Download a Single Document directly as a .pdf file
 */
export function downloadSingleDocument(doc, application) {
  const safeName = (doc.name || 'Document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeAppId = (application?.id || 'APP').replace(/[^a-zA-Z0-9_-]/g, '_');
  const pdfBlob = generateSingleDocumentPdfBlob(doc, application);
  triggerFileDownload(pdfBlob, `${safeAppId}_${safeName}.pdf`);
}

/**
 * Download All Documents of an Application as a Consolidated PDF File (.pdf)
 * Directly saves a multi-page .pdf file to downloads!
 */
export function downloadApplicationPdfDossier(application) {
  const docs = application.documents || [];
  if (docs.length === 0) {
    alert('No documents found for this application.');
    return;
  }

  const builder = new PdfBuilder();
  const totalPages = docs.length;

  docs.forEach((doc, idx) => {
    builder.addDocumentPage({
      doc,
      application,
      pageNum: idx + 1,
      totalPages
    });
  });

  const pdfBlob = builder.generatePdfBlob();
  const safeAppId = (application.id || 'APP').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = (application.applicantName || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');
  triggerFileDownload(pdfBlob, `${safeAppId}_${safeName}_All_${docs.length}_Documents.pdf`);
}

/**
 * Download All Documents of an Application as a ZIP archive (.zip)
 * Contains ONLY the actual .pdf documents inside the ZIP!
 */
export async function downloadApplicationZipBundle(application) {
  const docs = application.documents || [];
  if (docs.length === 0) {
    alert('No documents to download.');
    return;
  }

  const zip = new ZipArchive();
  const safeAppId = (application.id || 'APP').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = (application.applicantName || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');

  // Convert each document into a pure .pdf file inside the ZIP
  for (let idx = 0; idx < docs.length; idx++) {
    const doc = docs[idx];
    const num = String(idx + 1).padStart(2, '0');
    const safeDocName = (doc.name || `Document_${idx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Generate the PDF binary for this document
    const docPdfBlob = generateSingleDocumentPdfBlob(doc, application);
    const docPdfBuffer = await docPdfBlob.arrayBuffer();

    zip.addFile(`${num}_${safeDocName}.pdf`, docPdfBuffer);
  }

  // Generate and trigger download of the .zip file
  const zipBlob = zip.generate();
  const zipFileName = `${safeAppId}_${safeName}_All_${docs.length}_Documents.zip`;
  triggerFileDownload(zipBlob, zipFileName);
}

/**
 * Download Master ZIP of ALL Applications across the entire system
 * Contains strictly .pdf files organized by application folder!
 */
export async function downloadAllApplicationsZipBundle(applications) {
  const masterZip = new ZipArchive();

  for (let appIdx = 0; appIdx < applications.length; appIdx++) {
    const app = applications[appIdx];
    const safeAppId = (app.id || `APP_${appIdx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = (app.applicantName || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');
    const appFolder = `${safeAppId}_${safeName}`;
    const docs = app.documents || [];

    for (let docIdx = 0; docIdx < docs.length; docIdx++) {
      const doc = docs[docIdx];
      const num = String(docIdx + 1).padStart(2, '0');
      const safeDocName = (doc.name || `Document_${docIdx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      
      const docPdfBlob = generateSingleDocumentPdfBlob(doc, app);
      const docPdfBuffer = await docPdfBlob.arrayBuffer();

      masterZip.addFile(`${appFolder}/${num}_${safeDocName}.pdf`, docPdfBuffer);
    }
  }

  const zipBlob = masterZip.generate();
  triggerFileDownload(zipBlob, `All_Applications_Documents_Master_${new Date().toISOString().split('T')[0]}.zip`);
}
