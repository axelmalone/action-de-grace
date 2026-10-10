// usage: node capture.js page.html out.mp4 fps "querystring"
const { chromium } = require('playwright-core'); const { spawn } = require('child_process');
(async () => {
  const [,, src, out, fps = 30, qs = ''] = process.argv;
  const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + src + '?capture=1' + qs); await p.evaluate(() => document.fonts.ready); await p.evaluate(() => window.READY);
  const dur = await p.evaluate(() => DURATION), n = Math.ceil(dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => render(t), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', dur.toFixed(2) + 's');
})();
