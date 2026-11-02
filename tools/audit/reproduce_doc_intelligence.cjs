const path = require('path');
const puppeteer = require(path.resolve('frontend/node_modules/puppeteer-core'));
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runReproduction() {
  console.log('=== STARTING DOCUMENT INTELLIGENCE REPRODUCTION TEST ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const networkEvents = [];

  page.on('request', req => {
    if (req.url().includes('/documents/ingest')) {
      console.log(`[REQUEST SENT] ${req.method()} ${req.url()}`);
      networkEvents.push({
        type: 'request',
        url: req.url(),
        method: req.method(),
        headers: req.headers()
      });
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/documents/ingest')) {
      let body = '';
      try {
        body = await res.text();
      } catch (e) {
        body = `[Error reading body: ${e.message}]`;
      }
      console.log(`[RESPONSE RECEIVED] Status: ${res.status()} for ${res.url()}`);
      networkEvents.push({
        type: 'response',
        url: res.url(),
        status: res.status(),
        body: body.length > 500 ? body.slice(0, 500) + '...' : body
      });
    }
  });

  fs.mkdirSync('audit_screenshots', { recursive: true });

  const testRole = async (roleName, roleSelector) => {
    console.log(`\n--- TESTING ROLE: ${roleName} ---`);
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Logout if already logged in
    const logoutBtn = await page.$('#btn-logout, button[title="Sign out"], .lucide-log-out');
    if (logoutBtn) {
      console.log('Logging out existing session...');
      await logoutBtn.click();
      await sleep(1000);
    }

    // Select role
    console.log(`Selecting role: ${roleName}...`);
    await page.waitForSelector(roleSelector, { timeout: 10000 });
    await page.click(roleSelector);
    await sleep(500);

    // Click Login
    console.log('Clicking login submit...');
    await page.click('#login-submit-btn');
    await page.waitForSelector('#header-status-pill', { timeout: 15000 });
    await sleep(1500);

    // Navigate to Document Intelligence
    console.log('Navigating to #document-intelligence...');
    await page.goto('http://localhost:5173/#document-intelligence', { waitUntil: 'networkidle2' });
    await sleep(2000);

    // (A) Test certificate_demo_digital.pdf
    console.log('Uploading certificate_demo_digital.pdf...');
    const digitalPdfPath = path.resolve('A:/mnt/user-data/outputs/certificate_demo_digital.pdf');
    const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
    await fileInput.uploadFile(digitalPdfPath);
    await fileInput.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
    await sleep(1000);

    // Check if analyze button exists and click it
    const analyzeButtons = await page.$$('button');
    let clickedAnalyze = false;
    for (const btn of analyzeButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && text.includes('Analyze')) {
        console.log('Found Analyze button, clicking...');
        await btn.click();
        clickedAnalyze = true;
        break;
      }
    }
    if (!clickedAnalyze) {
      console.log('Notice: Analyze button not clicked (auto-analyzed on change or button not found)');
    }

    // Wait for processing
    await sleep(4000);

    // Capture DOM rendered state
    const digitalRendered = await page.evaluate(() => {
      const previewCanvas = document.querySelector('#document-page-canvas')?.innerText || 'No canvas';
      const rightPanel = document.querySelector('.xl\\:col-span-2')?.innerText || 'No right panel';
      return { previewCanvas: previewCanvas.slice(0, 400), rightPanel: rightPanel.slice(0, 400) };
    });
    console.log('Digital Rendered Canvas snippet:\n', digitalRendered.previewCanvas);
    console.log('Digital Rendered Right Panel snippet:\n', digitalRendered.rightPanel);

    await page.screenshot({ path: `audit_screenshots/reproduce_${roleName}_digital.png`, fullPage: true });
    console.log(`Saved audit_screenshots/reproduce_${roleName}_digital.png`);

    // (B) Test certificate_demo_scan.jpg
    console.log('Uploading certificate_demo_scan.jpg...');
    const scanJpgPath = path.resolve('A:/mnt/user-data/outputs/certificate_demo_scan.jpg');
    const fileInput2 = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
    await fileInput2.uploadFile(scanJpgPath);
    await fileInput2.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
    await sleep(1000);

    const analyzeButtons2 = await page.$$('button');
    for (const btn of analyzeButtons2) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && text.includes('Analyze')) {
        console.log('Clicking Analyze for scan...');
        await btn.click();
        break;
      }
    }
    await sleep(6000);

    const scanRendered = await page.evaluate(() => {
      const previewCanvas = document.querySelector('#document-page-canvas')?.innerText || 'No canvas';
      const rightPanel = document.querySelector('.xl\\:col-span-2')?.innerText || 'No right panel';
      return { previewCanvas: previewCanvas.slice(0, 400), rightPanel: rightPanel.slice(0, 400) };
    });
    console.log('Scan Rendered Canvas snippet:\n', scanRendered.previewCanvas);
    console.log('Scan Rendered Right Panel snippet:\n', scanRendered.rightPanel);

    await page.screenshot({ path: `audit_screenshots/reproduce_${roleName}_scan.png`, fullPage: true });
    console.log(`Saved audit_screenshots/reproduce_${roleName}_scan.png`);
  };

  try {
    await testRole('institution_user', '#preset-role-institution_user');
    await testRole('scrutiny_officer', '#preset-role-scrutiny_officer');
  } catch (err) {
    console.error('Reproduction error:', err);
  } finally {
    console.log('\n=== NETWORK EVENTS SUMMARY ===');
    console.log(JSON.stringify(networkEvents, null, 2));
    await browser.close();
  }
}

runReproduction();
