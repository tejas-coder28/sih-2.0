const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1400px;
    height: 820px;
    background: #0B132B;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #F8FAFC;
    padding: 36px 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 16px;
  }
  .header h1 {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .badge {
    background: rgba(14, 165, 233, 0.2);
    border: 1px solid rgba(14, 165, 233, 0.5);
    color: #38BDF8;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .sub {
    color: #94A3B8;
    font-size: 13px;
  }

  .grid {
    display: grid;
    grid-template-columns: 240px 40px 1fr 40px 280px;
    align-items: center;
    gap: 0;
    margin-top: 24px;
    height: 640px;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    justify-content: center;
  }

  .card {
    background: #1C2541;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .card-title {
    font-size: 13px;
    font-weight: 700;
    color: #38BDF8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-body {
    font-size: 12px;
    color: #CBD5E1;
    line-height: 1.45;
  }
  .tag {
    display: inline-block;
    background: rgba(255,255,255,0.06);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-family: monospace;
    margin-top: 6px;
    margin-right: 4px;
    color: #94A3B8;
  }

  .engines-container {
    background: rgba(30, 41, 59, 0.7);
    border: 1px dashed rgba(56, 189, 248, 0.35);
    border-radius: 16px;
    padding: 18px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .engines-header {
    font-size: 12px;
    font-weight: 700;
    color: #F59E0B;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }
  .engines-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    flex: 1;
  }
  .engine-box {
    background: #0F172A;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .engine-box.highlight {
    border-color: rgba(56, 189, 248, 0.4);
    background: #0B192E;
  }
  .engine-title {
    font-size: 12px;
    font-weight: 700;
    color: #F1F5F9;
    margin-bottom: 4px;
  }
  .engine-desc {
    font-size: 11px;
    color: #94A3B8;
    line-height: 1.35;
  }

  .arrow-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .arrow {
    width: 28px;
    height: 2px;
    background: #38BDF8;
    position: relative;
  }
  .arrow::after {
    content: '';
    position: absolute;
    right: 0;
    top: -4px;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid #38BDF8;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>PRAMAAN-X System Architecture <span class="badge">6 Core Engines</span></h1>
    <div class="sub" style="margin-top: 4px;">AICTE Approval Process Handbook (APH) Scrutiny & Regulatory Decision-Support Framework</div>
  </div>
  <div style="text-align: right;">
    <span class="badge" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #34D399;">Advisory Decision Support</span>
    <div class="sub" style="margin-top: 4px;">Never Auto-Rejects • Complete Audit Trail</div>
  </div>
</div>

<div class="grid">
  <!-- Col 1: Presentation & API -->
  <div class="col">
    <div class="card" style="border-top: 3px solid #38BDF8;">
      <div class="card-title">1. Web UI Client</div>
      <div class="card-body">
        React 19 + Tailwind CSS + Vite<br>
        11 Scrutiny Screens & Submodules<br>
        Evidence Lens & Split-Viewer
      </div>
      <div>
        <span class="tag">vis-network</span>
        <span class="tag">Dark Mode</span>
      </div>
    </div>

    <div class="card" style="border-top: 3px solid #6366F1;">
      <div class="card-title">2. API Gateway & RBAC</div>
      <div class="card-body">
        FastAPI 0.115.6 (REST / JSON)<br>
        85 Operational Endpoints<br>
        5 Role-Based Permitted Views<br>
        Institutional Tenant Isolation
      </div>
      <div>
        <span class="tag">JWT Bearer</span>
        <span class="tag">Pydantic v2</span>
      </div>
    </div>
  </div>

  <!-- Arrow -->
  <div class="arrow-col">
    <div class="arrow"></div>
  </div>

  <!-- Col 2: The 6 Engines -->
  <div class="engines-container">
    <div class="engines-header">3. Analytical Core: 6 Statutory & Forensic Decision Engines</div>
    <div class="engines-grid">
      
      <div class="engine-box highlight">
        <div>
          <div class="engine-title">A. Checklist & Ingestion Engine</div>
          <div class="engine-desc">Dynamic regulatory checklists by application type; multi-page PDF ingestion, classification, and session validity check.</div>
        </div>
        <div><span class="tag">Checklist Schema</span><span class="tag">Session Age</span></div>
      </div>

      <div class="engine-box highlight">
        <div>
          <div class="engine-title">B. PyMuPDF Field Extraction</div>
          <div class="engine-desc">Direct text stream & regex normalization; extracts intake, dates, land parcels, survey nos; 0.9013 Macro F1 score.</div>
        </div>
        <div><span class="tag">PyMuPDF (fitz)</span><span class="tag">Regex Parser</span></div>
      </div>

      <div class="engine-box highlight">
        <div>
          <div class="engine-title">C. Regulation-as-Code Engine</div>
          <div class="engine-desc">12 Declarative YAML rules for APH clauses; schema verification; cohort What-If simulation with hot reload.</div>
        </div>
        <div><span class="tag">YAML Rule Packs</span><span class="tag">What-If Sim</span></div>
      </div>

      <div class="engine-box highlight">
        <div>
          <div class="engine-title">D. NetworkX Impossibility Engine</div>
          <div class="engine-desc">Multi-college knowledge graph detecting spatial, faculty dual-employment, and temporal contradictions.</div>
        </div>
        <div><span class="tag">NetworkX Graph</span><span class="tag">Ghost Faculty</span></div>
      </div>

      <div class="engine-box highlight">
        <div>
          <div class="engine-title">E. Digital Forensics & Photo Radar</div>
          <div class="engine-desc">Error Level Analysis (ELA), copy-move detection, pHash (Hamming &le; 10) photo reuse clusters, and EXIF geometry.</div>
        </div>
        <div><span class="tag">imagehash pHash</span><span class="tag">ELA Heatmaps</span></div>
      </div>

      <div class="engine-box highlight">
        <div>
          <div class="engine-title">F. Verification Receipts & Ledger</div>
          <div class="engine-desc">Append-only SHA-256 Merkle chain; Ed25519 digital signature receipts; DB triggers blocking mutations.</div>
        </div>
        <div><span class="tag">Ed25519 (RFC 8032)</span><span class="tag">DB Triggers</span></div>
      </div>

    </div>
  </div>

  <!-- Arrow -->
  <div class="arrow-col">
    <div class="arrow"></div>
  </div>

  <!-- Col 3: Data & Mock Issuer -->
  <div class="col">
    <div class="card" style="border-top: 3px solid #10B981;">
      <div class="card-title">4. Persistence Layer</div>
      <div class="card-body">
        SQLite (local dev) / PostgreSQL (Compose)<br>
        SQLAlchemy 2.0 ORM<br>
        YAML Rule Packs & JSON Schemas<br>
        NetworkX In-Memory Graph Index
      </div>
      <div>
        <span class="tag">Append-Only</span>
        <span class="tag">Merkle Chain</span>
      </div>
    </div>

    <div class="card" style="border-top: 3px solid #F59E0B;">
      <div class="card-title">5. Mock Statutory Gateway</div>
      <div class="card-body">
        FastAPI Microservice (Port 8001)<br>
        510 Authority Records:<br>
        • State Fire & Emergency Services<br>
        • Affiliating Universities<br>
        • State Land Revenue (Bhoomi)<br>
        • NBA Accreditation Board
      </div>
      <div>
        <span class="tag">Port 8001</span>
        <span class="tag">Mock Issuer</span>
      </div>
    </div>
  </div>

</div>

</body>
</html>
`;

async function render() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 820, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  
  const outPath = path.join(docsDir, 'architecture.png');
  await page.screenshot({ path: outPath, type: 'png' });
  await browser.close();
  
  console.log('Successfully generated ' + outPath);
}

render().catch(err => {
  console.error(err);
  process.exit(1);
});

