const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUT_PATH = path.join(__dirname, '..', 'docs', 'screenshots', 'system-architecture.png');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  // Select Admin role
  await page.waitForSelector('#preset-role-admin');
  await page.click('#preset-role-admin');
  await new Promise(r => setTimeout(r, 600));
  await page.click('#login-submit-btn');

  await page.waitForSelector('#main-content', { timeout: 10000 });
  console.log('Logged in as admin.');

  // Navigate to system architecture
  await page.waitForSelector('#sidebar-tab-system-architecture');
  await page.click('#sidebar-tab-system-architecture');
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: OUT_PATH, fullPage: false });
  console.log('Saved 1920x1080 system-architecture screenshot to ' + OUT_PATH);

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

