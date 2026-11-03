const puppeteer = require('../../frontend/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'audit_pack', 'screenshots');

async function testLoginOffline() {
  console.log('=== [TEST] LOGIN ERROR RECOVERY & OFFLINE BACKEND PATH ===');

  const userDataDir = path.join(__dirname, '..', '..', 'scratch', 'chrome_login_' + Date.now());
  fs.mkdirSync(userDataDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    userDataDir: userDataDir,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Enable request interception to simulate backend offline
  await page.setRequestInterception(true);
  let simulateBackendOffline = true;

  page.on('request', req => {
    if (simulateBackendOffline && req.url().includes('/api/v1/auth/login')) {
      console.log('[NETWORK SIMULATOR] Aborting login request with connectionrefused (simulating backend down)');
      req.abort('connectionrefused');
    } else {
      req.continue();
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  // 1. Enter non-preset credentials while backend is offline
  console.log('Entering non-preset credentials while backend is offline...');
  await page.type('#login-email', 'inspector.custom@aicte-india.org');
  await page.type('#login-password', 'CustomPassword@2026');

  console.log('Submitting login form...');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // 2. Check that the error alert appears with the offline message
  const alertText = await page.evaluate(() => {
    const el = document.querySelector('#login-error-alert');
    return el ? el.innerText : '';
  });
  console.log('Displayed Error Alert text:', alertText);

  if (!alertText.includes('offline') && !alertText.includes('unreachable') && !alertText.includes('Network Error')) {
    throw new Error('Expected clear offline/unreachable error message, but got: ' + alertText);
  }

  // 3. Confirm NO crash or uncaught PRESET_ACCOUNTS ReferenceError occurred
  const hasReferenceError = consoleErrors.some(e => e.includes('PRESET_ACCOUNTS') || e.includes('is not defined'));
  if (hasReferenceError) {
    throw new Error('FAIL: Uncaught ReferenceError detected in console: ' + JSON.stringify(consoleErrors));
  }
  console.log('SUCCESS: Zero uncaught ReferenceErrors. Catch block cleanly handled error.');

  // 4. Capture screenshot of clear offline error message
  const offlineErrorScreenshot = path.join(SCREENSHOTS_DIR, 'login_offline_error_message.png');
  await page.screenshot({ path: offlineErrorScreenshot, fullPage: false });
  console.log(`Captured offline error screenshot: ${offlineErrorScreenshot}`);

  // 5. Now click a demo role preset while backend is offline
  console.log('Clicking Demo Role Preset while backend is offline...');
  await page.click('#preset-role-scrutiny_officer');
  await new Promise(r => setTimeout(r, 600));

  console.log('Submitting demo preset credentials...');
  await page.click('#login-submit-btn');

  // Should smoothly proceed to authenticated app shell in offline evaluation mode
  await page.waitForSelector('#main-content', { timeout: 8000 });
  console.log('SUCCESS: Gracefully proceeded into application in offline evaluation mode without crash!');

  const offlineDashboardScreenshot = path.join(SCREENSHOTS_DIR, 'login_offline_demo_authenticated.png');
  await page.screenshot({ path: offlineDashboardScreenshot, fullPage: false });

  await browser.close();

  console.log('\n=== LOGIN OFFLINE TEST COMPLETE ===');
  console.log('TEST RESULT: SUCCESS (Clear message shown when backend offline; no crash; demo mode fallback verified)\n');
}

testLoginOffline().catch(err => {
  console.error('Login offline test failed:', err);
  process.exit(1);
});

