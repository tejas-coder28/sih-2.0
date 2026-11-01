const puppeteer = require('../frontend/node_modules/puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1366, height: 768 }
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.setItem('pramaan_storage_consent', 'true'));
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('#preset-role-scrutiny_officer');
  await page.click('#preset-role-scrutiny_officer');
  await new Promise(r => setTimeout(r, 400));
  await page.click('#login-submit-btn');
  await page.waitForSelector('#main-content');
  await new Promise(r => setTimeout(r, 1000));

  const result = await page.evaluate(() => {
    const main = document.getElementById('main-content');
    return {
      windowInnerWidth: window.innerWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      mainScrollWidth: main.scrollWidth,
      mainClientWidth: main.clientWidth,
      hasWindowHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
      hasMainHorizontalScroll: main.scrollWidth > main.clientWidth
    };
  });
  console.log('1366px result:', result);

  // Take screenshot of FAQ section for Fix 1
  const faq = await page.$('#system-architecture-faq');
  if (faq) {
    await faq.screenshot({ path: 'audit_screenshots/fixround_faq_1366_light.png' });
    console.log('Saved audit_screenshots/fixround_faq_1366_light.png');
  }

  // Check dark mode
  await page.click('#theme-toggle-btn');
  await new Promise(r => setTimeout(r, 400));
  if (faq) {
    await faq.screenshot({ path: 'audit_screenshots/fixround_faq_1366_dark.png' });
    console.log('Saved audit_screenshots/fixround_faq_1366_dark.png');
  }

  await browser.close();
}
check().catch(console.error);
