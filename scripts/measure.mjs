// Reads the slow vs optimised comparison from the running app.
// Usage: npm run build && npm run preview (in another terminal), then npm run bench
import { chromium } from 'playwright-core';

const url = process.env.APP_URL ?? 'http://localhost:5400/#/performance';
const runs = Number(process.env.RUNS ?? 7);

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const samples = { slowMs: [], optimisedMs: [] };

for (let i = 0; i < runs; i++) {
  const page = await browser.newPage();
  await page.goto(url);
  await page.getByRole('button', { name: 'Run comparison' }).click();
  await page.getByTestId('optimised-wall').waitFor({ timeout: 60000 });
  const read = async (id) => Number(await page.getByTestId(id).textContent());
  samples.slowMs.push(await read('slow-wall'));
  samples.optimisedMs.push(await read('optimised-wall'));
  await page.close();
}
const version = browser.version();
await browser.close();

const out = {
  date: new Date().toISOString().slice(0, 10),
  browser: `Chrome ${version} headless`,
  runs,
  rows: 1500,
  parentUpdates: 30,
  medianMs: Object.fromEntries(Object.entries(samples).map(([k, v]) => [k, Number(median(v).toFixed(1))])),
  samples,
};
console.log(JSON.stringify(out, null, 2));
