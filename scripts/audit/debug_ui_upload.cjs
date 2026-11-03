const puppeteer = require('../frontend/node_modules/puppeteer-core');
const path = require('path');

async function debugUpload() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#preset-role-institution_user');
  await page.click('#preset-role-institution_user');
  await new Promise(r => setTimeout(r, 500));
  await page.click('#login-submit-btn');

  await page.waitForSelector('#header-status-pill', { timeout: 15000 });
  await page.goto('http://localhost:5173/#document-intelligence', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- Uploading scanned PDF ---');
  const scannedPdfPath = path.resolve('audit_fixtures', 'live_test_scanned.pdf');
  const input = await page.$('input[type="file"]');
  await input.uploadFile(scannedPdfPath);
  await input.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));

  // Wait until loading spinner disappears
  await page.waitForFunction(() => {
    return !document.querySelector('.animate-spin');
  }, { timeout: 20000 });

  const rightCard = await page.evaluate(() => {
    const el = document.querySelector('.xl\\:col-span-2');
    return el ? el.innerText : 'RIGHT CARD NOT FOUND';
  });
  console.log('--- RIGHT CARD CONTENT ---\n', rightCard);

  await browser.close();
}

debugUpload().catch(console.error);
