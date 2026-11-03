const fs = require('fs');
const path = require('path');

const puppeteerPath = path.resolve(__dirname, '../frontend/node_modules/puppeteer-core');
let puppeteer;
try {
  puppeteer = require(puppeteerPath);
} catch (e) {
  puppeteer = require('puppeteer-core');
}

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = process.argv[2] || 'http://127.0.0.1:5173';

const FRONTEND_PUB_DIR = path.resolve(__dirname, '../frontend/public/screenshots');
const DOCS_SHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');

for (const dir of [FRONTEND_PUB_DIR, DOCS_SHOTS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveDual(filename, buffer) {
  fs.writeFileSync(path.join(FRONTEND_PUB_DIR, filename), buffer);
  fs.writeFileSync(path.join(DOCS_SHOTS_DIR, filename), buffer);
}

function saveFrontendOnly(filename, buffer) {
  fs.writeFileSync(path.join(FRONTEND_PUB_DIR, filename), buffer);
}

function saveDocsOnly(filename, buffer) {
  fs.writeFileSync(path.join(DOCS_SHOTS_DIR, filename), buffer);
}

async function capture() {
  console.log(`Starting High-Resolution Screenshot Capture on ${FRONTEND_URL}...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Helper wait
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    // 1. Visit Login Page in Light Mode
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('pramaan_storage_consent', 'true');
      localStorage.setItem('pramaan_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    console.log('[1/14] Capturing Login page...');
    const loginShot = await page.screenshot({ fullPage: false });
    saveDual('login.png', loginShot);
    saveFrontendOnly('rbac_roles.png', loginShot);

    // Responsive Login screen captures
    const viewports = [
      { name: 'login_1440px.png', w: 1440, h: 900 },
      { name: 'login_1024px.png', w: 1024, h: 768 },
      { name: 'login_768px.png', w: 768, h: 1024 },
      { name: 'login_375px.png', w: 375, h: 812 },
    ];
    for (const vp of viewports) {
      await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
      await sleep(300);
      const shot = await page.screenshot({ fullPage: false });
      saveFrontendOnly(vp.name, shot);
    }

    // Reset to 1920x1080
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await sleep(300);

    // 2. Log in as Admin to access all tabs
    console.log('Logging in as Admin (AicteAdmin@2025)...');
    const adminPreset = await page.$('#preset-role-admin');
    if (adminPreset) {
      await adminPreset.click();
      await sleep(400);
    } else {
      await page.type('#login-email', 'admin@aicte-india.org');
      await page.type('#login-password', 'AicteAdmin@2025');
    }
    const loginBtn = await page.$('#login-submit-btn');
    if (loginBtn) await loginBtn.click();
    await page.waitForSelector('#main-content', { timeout: 15000 });
    await sleep(1500);

    // 3. Capture Dashboard
    console.log('[2/14] Capturing Dashboard...');
    const dashBtn = await page.$('#sidebar-tab-dashboard');
    if (dashBtn) await dashBtn.click();
    await sleep(1500);
    const dashShot = await page.screenshot({ fullPage: false });
    saveDual('dashboard.png', dashShot);

    // 4. Capture Evidence Lens
    console.log('[3/14] Capturing Evidence Lens...');
    const evBtn = await page.$('#sidebar-tab-evidence-lens');
    if (evBtn) await evBtn.click();
    await sleep(2000);
    const evShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('evidence_lens.png', evShot);
    saveFrontendOnly('evidence-lens.png', evShot);
    saveDocsOnly('evidence-lens.png', evShot);
    saveFrontendOnly('evidence-lens_responsive_check.png', evShot);

    // 5. Capture Manual Review Queue
    console.log('[4/14] Capturing Manual Review Queue...');
    const rvwBtn = await page.$('#sidebar-tab-manual-review-queue');
    if (rvwBtn) await rvwBtn.click();
    await sleep(1500);
    const rvwShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('manual_review_queue.png', rvwShot);
    saveDocsOnly('manual-review-queue.png', rvwShot);

    // 6. Capture Pre-Flight Scorecard
    console.log('[5/14] Capturing Pre-Flight Scorecard...');
    const preBtn = await page.$('#sidebar-tab-preflight');
    if (preBtn) await preBtn.click();
    await sleep(2000);
    const preShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('preflight.png', preShot);
    saveFrontendOnly('preflight_scorecard.png', preShot);
    saveDocsOnly('preflight-scorecard.png', preShot);
    saveDocsOnly('preflight-scorecard-live.png', preShot);
    saveFrontendOnly('preflight_responsive_check.png', preShot);

    // 7. Capture Document Intelligence
    console.log('[6/14] Capturing Document Intelligence...');
    const docBtn = await page.$('#sidebar-tab-document-intelligence');
    if (docBtn) await docBtn.click();
    await sleep(2000);
    const docShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('document_intelligence.png', docShot);
    saveDocsOnly('document-intelligence.png', docShot);

    // 8. Capture Photo Reuse Radar
    console.log('[7/14] Capturing Photo Reuse Radar...');
    const photoBtn = await page.$('#sidebar-tab-photo-radar');
    if (photoBtn) await photoBtn.click();
    await sleep(2500);
    const photoShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('photo_radar.png', photoShot);
    saveFrontendOnly('photo_reuse_radar.png', photoShot);
    saveDocsOnly('photo-reuse-radar.png', photoShot);
    saveFrontendOnly('photo-radar_responsive_check.png', photoShot);

    // 9. Capture Impossibility Engine
    console.log('[8/14] Capturing Impossibility Engine...');
    const impBtn = await page.$('#sidebar-tab-impossibility-engine');
    if (impBtn) await impBtn.click();
    await sleep(3000); // Wait for vis-network graph stabilization
    const impShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('impossibility_engine.png', impShot);
    saveDocsOnly('impossibility-engine.png', impShot);
    saveFrontendOnly('impossibility-engine_responsive_check.png', impShot);

    // 10. Capture Audit & Receipts Ledger & Tamper Demo
    console.log('[9/14] Capturing Audit & Receipts Ledger (Intact State)...');
    const auditBtn = await page.$('#sidebar-tab-audit-ledger');
    if (auditBtn) await auditBtn.click();
    await sleep(2000);
    const auditShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('audit_ledger.png', auditShot);
    saveFrontendOnly('audit_receipts.png', auditShot);
    saveDocsOnly('audit-receipts.png', auditShot);
    saveDocsOnly('tamper-demo-intact.png', auditShot);
    saveFrontendOnly('audit-ledger_responsive_check.png', auditShot);

    // Tamper Demo: Toggle switch -> modal appears
    console.log('[10/14] Capturing Tamper Demo (Modal)...');
    const tamperToggle = await page.$('#demo-tamper-toggle');
    if (tamperToggle) {
      await tamperToggle.click();
      await sleep(600);
      const modalShot = await page.screenshot({ fullPage: false });
      saveDocsOnly('tamper-demo-modal.png', modalShot);

      // Confirm tamper modal
      console.log('Injecting tampering...');
      const confirmBtns = await page.$$('button');
      for (const b of confirmBtns) {
        const text = await (await b.getProperty('innerText')).jsonValue();
        if (text && text.includes('Inject Tampering')) {
          await b.click();
          break;
        }
      }
      await sleep(1500);

      // Tampered state
      console.log('Capturing Tampered state...');
      const tamperedShot = await page.screenshot({ fullPage: false });
      saveDocsOnly('tamper-demo-tampered.png', tamperedShot);

      // Restore pristine chain
      console.log('Restoring pristine ledger...');
      const toggleOff = await page.$('#demo-tamper-toggle');
      if (toggleOff) {
        await toggleOff.click();
        await sleep(2000);
      }
      const restoredShot = await page.screenshot({ fullPage: false });
      saveDocsOnly('tamper-demo-restored.png', restoredShot);
    }

    // 11. Capture Rules Catalog & What-If
    console.log('[11/14] Capturing Rules Catalog & What-If...');
    const rulesBtn = await page.$('#sidebar-tab-regulations');
    if (rulesBtn) await rulesBtn.click();
    await sleep(2000);
    const rulesShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('regulations.png', rulesShot);
    saveDocsOnly('rules-what-if.png', rulesShot);

    // 12. Capture Inspection Planner
    console.log('[12/14] Capturing Inspection Planner...');
    const inspBtn = await page.$('#sidebar-tab-inspection-planner');
    if (inspBtn) await inspBtn.click();
    await sleep(2000);
    const inspShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('inspection_planner.png', inspShot);
    saveDocsOnly('inspection-planner.png', inspShot);

    // 13. Capture System Architecture Page
    console.log('[13/14] Capturing System Architecture page...');
    const archBtn = await page.$('#sidebar-tab-system-architecture');
    if (archBtn) await archBtn.click();
    await sleep(2000);
    const archShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('system_architecture_page.png', archShot);
    saveDocsOnly('system-architecture.png', archShot);

    // 14. Capture Dark Mode Check
    console.log('[14/14] Capturing Dark Mode check...');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('pramaan_theme', 'dark');
    });
    // Return to dashboard for dark mode capture
    const dashBtnDark = await page.$('#sidebar-tab-dashboard');
    if (dashBtnDark) await dashBtnDark.click();
    await sleep(1500);
    const darkShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('dark_mode_check.png', darkShot);
    saveDocsOnly('dark-mode.png', darkShot);

    // 1366x768 zoom check
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await sleep(800);
    const zoomShot = await page.screenshot({ fullPage: false });
    saveFrontendOnly('dashboard_1366x768_125zoom_after.png', zoomShot);

    console.log('✅ ALL SCREENSHOTS SUCCESSFULLY CAPTURED AND UPDATED IN FRONTEND AND DOCS!');
  } catch (err) {
    console.error('❌ Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();

