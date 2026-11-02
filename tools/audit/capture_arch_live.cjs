const puppeteer = require('../frontend/node_modules/puppeteer-core');
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
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('pramaan_storage_consent', 'true');
    localStorage.setItem('pramaan_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  });
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
  await new Promise(r => setTimeout(r, 2000));

  // Take crisp 1920x1080 screenshot
  await page.screenshot({ path: OUT_PATH, fullPage: false });
  console.log('Saved 1920x1080 system-architecture screenshot to ' + OUT_PATH);

  // Also save audit screenshots for verification
  await page.screenshot({ path: 'audit_screenshots/fixround_architecture_1920_light.png', fullPage: false });
  
  // Dark mode test
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('pramaan_theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'audit_screenshots/fixround_architecture_1920_dark.png', fullPage: false });
  console.log('Saved dark mode screenshot');

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
