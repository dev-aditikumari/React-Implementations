// Visits every route in the production preview, checks for console errors and horizontal scroll,
// and writes screenshots to docs/.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const base = process.env.APP_URL ?? 'http://localhost:5400/';
const routes = ['', 'state', 'context', 'hooks', 'forms', 'redux', 'performance', 'errors-a11y', 'does-not-exist'];
mkdirSync('docs', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let failures = 0;

for (const [label, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ viewport });
  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}#/${route}`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const h1 = await page.getByRole('heading', { level: 1 }).textContent();
    const ok = errors.length === 0 && !overflow;
    if (!ok) failures++;
    console.log(`${label} /${route}: h1="${h1}" consoleErrors=${errors.length} horizontalScroll=${overflow} ${ok ? 'OK' : 'FAIL'}`);
    errors.forEach((e) => console.log('   ', e));
    const shots = { desktop: { '': 'home', state: 'state', forms: 'forms', redux: 'redux' }, mobile: { '': 'mobile-home', performance: 'mobile-performance' } };
    const name = shots[label][route];
    if (name) await page.screenshot({ path: `docs/${name}.png`, fullPage: label === 'mobile' ? false : false });
    await page.close();
  }
  await context.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
