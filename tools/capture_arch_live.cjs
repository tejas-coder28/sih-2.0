const puppeteer = require('../frontend/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const ARCH_PATH = path.join(__dirname, '..', 'docs', 'screenshots', 'system-architecture.png');
const PIPELINE_PATH = path.join(__dirname, '..', 'docs', 'screenshots', 'system-pipeline.png');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // Suppress storage consent banner so it does not obstruct views
  await page.evaluate(() => {
    localStorage.setItem('pramaan_storage_consent', 'true');
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
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss any lingering notice if present
  await page.evaluate(() => {
    const banner = document.getElementById('storage-consent-banner');
    if (banner) banner.remove();
  });

  // Capture Multi-Tier Interactive Architecture
  await page.waitForSelector('#tab-architecture');
  await page.click('#tab-architecture');
  await new Promise(r => setTimeout(r, 800));

  // Select Tier 3 (Document Intelligence) for detailed display
  const tier3Node = await page.$('#arch-node-ocr-layer');
  if (tier3Node) {
    await tier3Node.click();
    await new Promise(r => setTimeout(r, 600));
  }

  await page.screenshot({ path: ARCH_PATH, fullPage: false });
  console.log('Saved 1920x1080 system-architecture screenshot to ' + ARCH_PATH);

  // Capture End-to-End Pipeline Simulator view
  const pipelineTab = await page.$('#tab-pipeline');
  if (pipelineTab) {
    await pipelineTab.click();
    await new Promise(r => setTimeout(r, 800));

    // Step to Stage 2 (PyMuPDF Extraction & Document Classification)
    const nextBtn = await page.$('#pipeline-next-btn');
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }

    await page.screenshot({ path: PIPELINE_PATH, fullPage: false });
    console.log('Saved 1920x1080 system-pipeline screenshot to ' + PIPELINE_PATH);
  }

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
