// usage: node frames.js page.html outdir t1,t2,...   -> stills at given seconds
const { chromium } = require('playwright-core');
(async () => {
  const [,, src, out, times, qs = ''] = process.argv;
  const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + src + '?capture=1' + qs); await p.evaluate(() => document.fonts.ready); await p.evaluate(() => window.READY);
  for (const t of times.split(',')) { await p.evaluate(t => render(t), +t); await p.screenshot({ path: `${out}/t${t}.png` }); }
  await b.close();
})();
