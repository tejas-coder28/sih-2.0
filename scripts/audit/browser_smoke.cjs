const fs = require('fs');
const path = require('path');

const puppeteerPath = path.resolve(__dirname, '../frontend/node_modules/puppeteer-core');
let puppeteer;
try {
  puppeteer = require(puppeteerPath);
} catch (e) {
  try {
    puppeteer = require('puppeteer-core');
  } catch (err) {
    console.error(JSON.stringify({ error: 'puppeteer-core not found: ' + err.message }));
    process.exit(1);
  }
}

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = process.argv[2] || process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
const SCREENSHOTS_DIR = process.argv[3] || process.env.SCREENSHOTS_DIR || path.resolve(__dirname, '../audit_screenshots/deploy_smoke');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const TABS = [
  { id: 'dashboard', name: 'Dashboard', selector: '#sidebar-tab-dashboard' },
  { id: 'evidence-lens', name: 'Evidence Lens', selector: '#sidebar-tab-evidence-lens' },
  { id: 'manual-review-queue', name: 'Manual Review Queue', selector: '#sidebar-tab-manual-review-queue' },
  { id: 'preflight', name: 'Pre-Flight Scorecard', selector: '#sidebar-tab-preflight' },
  { id: 'document-intelligence', name: 'Document Intelligence', selector: '#sidebar-tab-document-intelligence' },
  { id: 'photo-radar', name: 'Photo Reuse Radar', selector: '#sidebar-tab-photo-radar' },
  { id: 'impossibility-engine', name: 'Impossibility Engine', selector: '#sidebar-tab-impossibility-engine' },
  { id: 'audit-ledger', name: 'Audit & Receipts Ledger', selector: '#sidebar-tab-audit-ledger' },
  { id: 'inspection-planner', name: 'Inspection Planner', selector: '#sidebar-tab-inspection-planner' },
  { id: 'system-architecture', name: 'System Architecture', selector: '#sidebar-tab-system-architecture' },
];

async function runBrowserSmoke() {
  const results = {
    frontend_url: FRONTEND_URL,
    screenshots_dir: SCREENSHOTS_DIR,
    login: { status: 'PENDING', error: null },
    pages: [],
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message || String(err));
    });

    // 1. Navigate to Frontend
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('pramaan_storage_consent', 'true');
      localStorage.setItem('pramaan_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });

    // 2. Log in as Scrutiny Officer
    const officerPresetBtn = await page.$('#preset-role-scrutiny_officer');
    if (officerPresetBtn) {
      await officerPresetBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    } else {
      await page.waitForSelector('#login-email', { timeout: 10000 });
      await page.type('#login-email', 'scrutiny.officer@aicte-india.org');
      await page.type('#login-password', 'AicteOfficer@2025');
    }

    const submitBtn = await page.$('#login-submit-btn');
    if (submitBtn) {
      await submitBtn.click();
    }

    // Wait for main dashboard container
    await page.waitForSelector('#main-content', { timeout: 15000 });
    results.login.status = 'PASS';
    results.login.user = 'scrutiny.officer@aicte-india.org';
    results.login.role = 'scrutiny_officer';

    // 3. Visit each sidebar tab and save screenshot
    for (const tab of TABS) {
      const pageResult = {
        id: tab.id,
        name: tab.name,
        status: 'PENDING',
        screenshot: null,
        error: null,
      };

      try {
        const tabBtn = await page.$(tab.selector);
        if (!tabBtn) {
          throw new Error(`Sidebar button selector '${tab.selector}' not found`);
        }

        await tabBtn.click();
        // Give time for animations, graph simulations, or data fetches to settle
        await new Promise((r) => setTimeout(r, 1200));

        const screenshotFileName = `${tab.id}.png`;
        const screenshotFilePath = path.join(SCREENSHOTS_DIR, screenshotFileName);
        await page.screenshot({ path: screenshotFilePath, fullPage: false });

        pageResult.screenshot = screenshotFilePath;

        // Check for fatal unhandled error in DOM
        const fatalError = await page.evaluate(() => {
          const alertEl = document.querySelector('[role="alert"], .text-rose-500');
          if (alertEl && alertEl.innerText && alertEl.innerText.toLowerCase().includes('critical unhandled')) {
            return alertEl.innerText;
          }
          return null;
        });

        if (fatalError) {
          pageResult.status = 'FAIL';
          pageResult.error = fatalError;
        } else {
          pageResult.status = 'PASS';
        }
      } catch (tabErr) {
        pageResult.status = 'FAIL';
        pageResult.error = tabErr.message;
      }

      results.pages.push(pageResult);
    }
  } catch (fatalErr) {
    results.login.status = 'FAIL';
    results.login.error = fatalErr.message;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

runBrowserSmoke();
