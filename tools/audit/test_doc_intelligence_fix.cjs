const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve('frontend/node_modules/puppeteer-core'));

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDocIntelligenceVerification() {
  console.log('=== STARTING AUTHORITATIVE DOC INTELLIGENCE VERIFICATION TEST ===');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('error') || msg.text().includes('fail')) {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });
  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err.message));

  page.on('request', req => {
    if (req.url().includes('/documents/ingest')) {
      console.log(`[REQUEST] ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/documents/ingest')) {
      const text = await res.text().catch(e => e.message);
      console.log(`[RESPONSE] ${res.status()} ${res.url()} ->`, text.slice(0, 300));
    }
  });

  fs.mkdirSync('audit_screenshots', { recursive: true });
  fs.mkdirSync('docs/screenshots', { recursive: true });

  const testRole = async (roleName, roleSelector) => {
    console.log(`\n========================================`);
    console.log(`>>> VERIFYING ROLE: ${roleName}`);
    console.log(`========================================`);

    // 1. Clear storage and navigate to login
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Select role preset & submit login
    console.log(`Selecting preset: ${roleSelector}...`);
    await page.waitForSelector(roleSelector, { timeout: 10000 });
    await page.click(roleSelector);
    await sleep(500);

    console.log('Clicking login...');
    await page.click('#login-submit-btn');
    await page.waitForSelector('#header-status-pill', { timeout: 15000 });
    await sleep(1500);

    // Navigate to Document Intelligence
    console.log('Navigating to #document-intelligence...');
    await page.goto('http://localhost:5173/#document-intelligence', { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Verify initial active source pill
    const initialSourceText = await page.$eval('#active-source-pill', el => el.innerText);
    console.log(`Initial active source pill: "${initialSourceText}"`);

    // ---------------------------------------------------------
    // TEST 1: certificate_demo_digital.pdf
    // ---------------------------------------------------------
    console.log('\n--- [TEST 1] Uploading certificate_demo_digital.pdf ---');
    const digitalPdfPath = path.resolve('audit_fixtures', 'certificate_demo_digital.pdf');
    if (!fs.existsSync(digitalPdfPath)) {
      throw new Error(`File not found: ${digitalPdfPath}`);
    }

    const fileInput1 = await page.waitForSelector('#doc-intel-file-input', { timeout: 10000 });
    await fileInput1.uploadFile(digitalPdfPath);
    await fileInput1.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
    await sleep(600);

    // Verify staged source label
    const stagedSourceText = await page.$eval('#active-source-pill', el => el.innerText);
    console.log(`Staged source label: "${stagedSourceText}"`);
    if (!stagedSourceText.includes('certificate_demo_digital.pdf')) {
      throw new Error(`FAILED: Active source did not update to upload: ${stagedSourceText}`);
    }

    // Verify Staged File Card or Analyze button
    console.log('Clicking Analyze button...');
    const analyzeBtn = await page.waitForSelector('#btn-analyze-document, #btn-staged-run-analyze', { timeout: 10000 });
    await analyzeBtn.click();

    // Wait for loading to finish
    console.log('Waiting for analysis to complete...');
    await sleep(600);
    await page.waitForFunction(() => !document.querySelector('#doc-intel-loading-card'), { timeout: 35000 });
    await page.waitForSelector('#document-rendered-page-img', { timeout: 15000 });
    await sleep(1000);

    // Verify Rendered Page Image
    const hasRenderedImg = await page.$eval('#document-rendered-page-img', el => Boolean(el && el.src && el.src.startsWith('data:image/'))).catch(() => false);
    console.log(`True Rendered Document Page image present: ${hasRenderedImg}`);
    if (!hasRenderedImg) {
      throw new Error('FAILED: Document preview canvas does not render the uploaded document page image!');
    }

    // Capture whole text from both preview and right panel
    const pageContent = await page.evaluate(() => {
      const canvas = document.querySelector('#document-page-canvas')?.innerText || '';
      const right = document.querySelector('#doc-intel-right-card')?.innerText || '';
      const rows = Array.from(document.querySelectorAll('#doc-intel-field-rows > div')).map(r => r.innerText);
      const engine = document.querySelector('#doc-intel-engine')?.innerText || '';
      const filename = document.querySelector('#doc-intel-filename')?.innerText || '';
      const fieldCount = document.querySelector('#doc-intel-field-count')?.innerText || '';
      return { canvas, right, rows, engine, filename, fieldCount };
    });

    console.log(`Document Intelligence Results for digital PDF:`);
    console.log(`  Engine: "${pageContent.engine}"`);
    console.log(`  Filename: "${pageContent.filename}"`);
    console.log(`  Field Count: "${pageContent.fieldCount}"`);
    console.log(`  Extracted Rows Sample:`, pageContent.rows.slice(0, 5));

    // CRITICAL ASSERTION: Sample value FS/NOC/BLR/2024/9812 MUST NOT APPEAR!
    if (pageContent.canvas.includes('FS/NOC/BLR/2024/9812') || pageContent.right.includes('FS/NOC/BLR/2024/9812')) {
      throw new Error('FAILED: Hardcoded sample reference FS/NOC/BLR/2024/9812 appeared after digital upload!');
    }
    if (pageContent.canvas.includes('gt_font_inconsistency.pdf') || pageContent.right.includes('gt_font_inconsistency.pdf')) {
      throw new Error('FAILED: Hardcoded sample filename gt_font_inconsistency.pdf appeared after digital upload!');
    }

    // Required fields verification
    const allText = pageContent.canvas + ' ' + pageContent.right;
    const expectedValues = [
      { name: 'Reference Number', val: 'FIRE/KA/BLR/2026/04817' },
      { name: 'Institution', val: 'Apex Institute of Technology & Science' },
      { name: 'AICTE ID', val: '1-109283711' },
      { name: 'Issue Date', val: '2026-06-15' },
      { name: 'Validity Date', val: '2027-12-31' },
      { name: 'Engine Name', val: 'PyMuPDF text layer' }
    ];

    for (const exp of expectedValues) {
      if (!allText.includes(exp.val)) {
        throw new Error(`FAILED: Expected ${exp.name} "${exp.val}" not found in page content!`);
      }
      console.log(`  [PASS] Verified ${exp.name}: "${exp.val}"`);
    }

    const digitalScreenshot = `audit_screenshots/live_verify_${roleName}_digital.png`;
    await page.screenshot({ path: digitalScreenshot, fullPage: true });
    fs.copyFileSync(digitalScreenshot, `docs/screenshots/live_verify_${roleName}_digital.png`);
    console.log(`Saved screenshot: ${digitalScreenshot}`);

    // ---------------------------------------------------------
    // TEST 2: certificate_demo_scan.jpg (Only run for institution_user to preserve test time)
    // ---------------------------------------------------------
    if (roleName === 'institution_user') {
      console.log('\n--- [TEST 2] Uploading certificate_demo_scan.jpg (RapidOCR) ---');
      const scanJpgPath = path.resolve('audit_fixtures', 'certificate_demo_scan.jpg');
      if (!fs.existsSync(scanJpgPath)) {
        throw new Error(`File not found: ${scanJpgPath}`);
      }

      const fileInput2 = await page.waitForSelector('#doc-intel-file-input', { timeout: 10000 });
      await fileInput2.uploadFile(scanJpgPath);
      await fileInput2.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })));
      await sleep(600);

      // Verify staged chip replaced previous result completely (no stale fields)
      const scanSourceText = await page.$eval('#active-source-pill', el => el.innerText);
      console.log(`Scan source label: "${scanSourceText}"`);
      if (!scanSourceText.includes('certificate_demo_scan.jpg')) {
        throw new Error(`FAILED: Active source did not update to scanned upload: ${scanSourceText}`);
      }

      console.log('Clicking Analyze for scan...');
      const analyzeBtn2 = await page.waitForSelector('#btn-analyze-document, #btn-staged-run-analyze', { timeout: 10000 });
      await analyzeBtn2.click();

      // Wait for RapidOCR (up to 35s on CPU)
      console.log('Waiting for RapidOCR deep learning model inference...');
      await sleep(600);
      await page.waitForFunction(() => !document.querySelector('#doc-intel-loading-card'), { timeout: 45000 });
      await page.waitForSelector('#document-rendered-page-img', { timeout: 15000 });
      await sleep(1000);

      const scanContent = await page.evaluate(() => {
        const canvas = document.querySelector('#document-page-canvas')?.innerText || '';
        const right = document.querySelector('#doc-intel-right-card')?.innerText || '';
        const engine = document.querySelector('#doc-intel-engine')?.innerText || '';
        const filename = document.querySelector('#doc-intel-filename')?.innerText || '';
        const fieldCount = document.querySelector('#doc-intel-field-count')?.innerText || '';
        return { canvas, right, engine, filename, fieldCount };
      });

      console.log(`Document Intelligence Results for scanned JPG:`);
      console.log(`  Engine: "${scanContent.engine}"`);
      console.log(`  Filename: "${scanContent.filename}"`);
      console.log(`  Field Count: "${scanContent.fieldCount}"`);

      // CRITICAL ASSERTION: Sample value FS/NOC/BLR/2024/9812 MUST NOT APPEAR!
      if (scanContent.canvas.includes('FS/NOC/BLR/2024/9812') || scanContent.right.includes('FS/NOC/BLR/2024/9812')) {
        throw new Error('FAILED: Hardcoded sample reference FS/NOC/BLR/2024/9812 appeared after scan upload!');
      }

      // Check RapidOCR values
      if (!scanContent.engine.includes('RapidOCR')) {
        throw new Error(`FAILED: Expected RapidOCR engine for scanned JPG, got "${scanContent.engine}"`);
      }
      console.log(`  [PASS] Verified Engine: RapidOCR`);

      const scanAllText = scanContent.canvas + ' ' + scanContent.right;
      if (!scanAllText.includes('FIRE/KA/BLR/2026/04817')) {
        throw new Error('FAILED: Reference FIRE/KA/BLR/2026/04817 not found in scan results!');
      }
      console.log(`  [PASS] Verified Reference: FIRE/KA/BLR/2026/04817`);

      if (!scanAllText.includes('1-109283711')) {
        throw new Error('FAILED: AICTE ID 1-109283711 not found in scan results!');
      }
      console.log(`  [PASS] Verified AICTE ID: 1-109283711`);

      const scanScreenshot = `audit_screenshots/live_verify_${roleName}_scan.png`;
      await page.screenshot({ path: scanScreenshot, fullPage: true });
      fs.copyFileSync(scanScreenshot, `docs/screenshots/live_verify_${roleName}_scan.png`);
      console.log(`Saved screenshot: ${scanScreenshot}`);
    }
  };

  try {
    await testRole('institution_user', '#preset-role-institution_user');
    await testRole('scrutiny_officer', '#preset-role-scrutiny_officer');
    console.log('\n============================================================');
    console.log('>>> ALL AUTHORITATIVE DOCUMENT INTELLIGENCE TESTS PASSED! <<<');
    console.log('============================================================\n');
  } catch (err) {
    console.error('\nTEST FAILURE:', err);
    const bodyHtml = await page.evaluate(() => document.body.innerText).catch(() => 'Failed to get text');
    console.log('PAGE TEXT ON FAILURE:\n', bodyHtml.slice(0, 1000));
    await page.screenshot({ path: 'audit_screenshots/live_verify_failure.png', fullPage: true });
    throw err;
  } finally {
    await browser.close();
  }
}

runDocIntelligenceVerification();
