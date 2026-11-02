const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUT_PATH = path.join(__dirname, '..', 'docs', 'screenshots', 'tamper-demo-modal.png');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  // Select Auditor role
  await page.waitForSelector('#preset-role-auditor');
  await page.click('#preset-role-auditor');
  await new Promise(r => setTimeout(r, 600));
  await page.click('#login-submit-btn');

  await page.waitForSelector('#main-content', { timeout: 10000 });
  console.log('Logged in as auditor.');

  // Navigate to audit ledger
  await page.waitForSelector('#sidebar-tab-audit-ledger');
  await page.click('#sidebar-tab-audit-ledger');
  await new Promise(r => setTimeout(r, 1200));

  // Click tamper toggle to open confirmation modal
  await page.waitForSelector('#demo-tamper-toggle');
  await page.click('#demo-tamper-toggle');
  await new Promise(r => setTimeout(r, 800));

  // Capture screenshot of the confirmation modal
  await page.screenshot({ path: OUT_PATH, fullPage: false });
  console.log('Saved tamper-demo-modal screenshot to ' + OUT_PATH);

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

