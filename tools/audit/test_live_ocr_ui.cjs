const puppeteer = require('../frontend/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLiveTest() {
  console.log('Starting Authoritative Puppeteer Live OCR Test...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Go to Login page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // 2. Click preset button for institution_user
  console.log('Selecting Institution User (Apex Tech)...');
  await page.waitForSelector('#preset-role-institution_user', { timeout: 10000 });
  await page.click('#preset-role-institution_user');
  await sleep(600);

  // 3. Click Login button
  console.log('Submitting login credentials...');
  await page.click('#login-submit-btn');

  // Wait for login to complete and app header to appear
  console.log('Waiting for header status pill...');
  await page.waitForSelector('#header-status-pill', { timeout: 15000 });
  await sleep(2000);

  // 4. Verify Live API badge in Navbar
  const pillText = await page.evaluate(() => {
    const pill = document.querySelector('#header-status-pill');
    return pill ? pill.innerText : '';
  });
  console.log('Header status pill text:', pillText);
  if (!pillText.includes('API Live')) {
    throw new Error('FAILED: Navbar does not show API Live: ' + pillText);
  }
  console.log('SUCCESS: Navbar shows "API Live" (emerald indicator)!');

  // 5. Test (A): Digital PDF in Document Intelligence
  console.log('--- Test A: Uploading Digital PDF ---');
  await page.goto('http://localhost:5173/#document-intelligence', { waitUntil: 'networkidle2' });
  await sleep(2000);

  const digitalPdfPath = path.resolve('audit_fixtures', 'live_test_digital.pdf');
  const inputDigital = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
  await inputDigital.uploadFile(digitalPdfPath);
  await inputDigital.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));

  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 25000 });
  await sleep(1000);

  const digitalEngine = await page.evaluate(() => {
    const el = document.querySelector('.xl\\:col-span-2');
    return el ? el.innerText : '';
  });
  console.log('Digital PDF Results:\n', digitalEngine.slice(0, 300));
  if (!digitalEngine.includes('PyMuPDF text layer')) {
    throw new Error('FAILED: Digital PDF did not show PyMuPDF text layer');
  }
  await page.screenshot({ path: 'audit_screenshots/live_ocr_digital_pdf.png', fullPage: true });
  console.log('SUCCESS: Saved audit_screenshots/live_ocr_digital_pdf.png');

  // 6. Test (B): Scanned PDF in Document Intelligence
  console.log('--- Test B: Uploading Scanned PDF ---');
  const scannedPdfPath = path.resolve('audit_fixtures', 'live_test_scanned.pdf');
  const inputScanned = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
  await inputScanned.uploadFile(scannedPdfPath);
  await inputScanned.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));

  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 25000 });
  await sleep(1000);

  const scannedEngine = await page.evaluate(() => {
    const el = document.querySelector('.xl\\:col-span-2');
    return el ? el.innerText : '';
  });
  console.log('Scanned PDF Results:\n', scannedEngine.slice(0, 300));
  if (!scannedEngine.includes('RapidOCR')) {
    throw new Error('FAILED: Scanned PDF did not show RapidOCR');
  }
  await page.screenshot({ path: 'audit_screenshots/live_ocr_scanned_pdf.png', fullPage: true });
  console.log('SUCCESS: Saved audit_screenshots/live_ocr_scanned_pdf.png');

  // 7. Test (C): PNG Scan in Document Intelligence
  console.log('--- Test C: Uploading PNG Scan ---');
  const pngPath = path.resolve('audit_fixtures', 'live_test_scan.png');
  const inputPng = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
  await inputPng.uploadFile(pngPath);
  await inputPng.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));

  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 25000 });
  await sleep(1000);

  const pngEngine = await page.evaluate(() => {
    const el = document.querySelector('.xl\\:col-span-2');
    return el ? el.innerText : '';
  });
  console.log('PNG Scan Results:\n', pngEngine.slice(0, 300));
  if (!pngEngine.includes('RapidOCR')) {
    throw new Error('FAILED: PNG scan did not show RapidOCR');
  }
  await page.screenshot({ path: 'audit_screenshots/live_ocr_image_png.png', fullPage: true });
  console.log('SUCCESS: Saved audit_screenshots/live_ocr_image_png.png');

  // 8. Test (D): Pre-Flight Scorecard Upload
  console.log('--- Test D: Pre-Flight Scorecard Upload ---');
  await page.goto('http://localhost:5173/#preflight', { waitUntil: 'networkidle2' });
  await sleep(2000);

  const preflightInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
  await preflightInput.uploadFile(scannedPdfPath);
  await preflightInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));

  await sleep(6000);

  const preflightText = await page.evaluate(() => document.body.innerText);
  console.log('Preflight text check includes RapidOCR:', preflightText.includes('RapidOCR'));
  await page.screenshot({ path: 'audit_screenshots/live_preflight_scorecard.png', fullPage: true });
  console.log('SUCCESS: Saved audit_screenshots/live_preflight_scorecard.png');

  await browser.close();
  console.log('\n======================================================');
  console.log('ALL VERIFICATIONS AND SCREENSHOTS COMPLETED CLEANLY!');
  console.log('======================================================');
}

runLiveTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
