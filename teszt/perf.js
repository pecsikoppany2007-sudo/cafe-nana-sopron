const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const b = await chromium.launch();
  for (const [name, dev, rate] of [['Pixel7 4x', devices['Pixel 7'], 4], ['Pixel7 6x', devices['Pixel 7'], 6], ['Desktop 4x', { viewport: { width: 1440, height: 900 } }, 4]]) {
    const o={...dev}; delete o.defaultBrowserType; const ctx = await b.newContext(o); const p = await ctx.newPage();
    await p.goto('http://localhost:8766/', { waitUntil: 'load' }); await p.waitForTimeout(4500);
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await p.evaluate(() => {
      window.__f = []; window.__loaf = [];
      let last = performance.now();
      (function tick(t) { window.__f.push(t - last); last = t; requestAnimationFrame(tick); })(performance.now());
      try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__loaf.push(e.duration))).observe({ type: 'long-animation-frame', buffered: false }); } catch (e) {}
    });
    const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const vp = dev.viewport;
    let y = 0;
    while (y < H) {
      await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(vp.width / 2), y: Math.round(vp.height / 2), yDistance: -700, speed: 1400, repeatCount: 1 });
      y = await p.evaluate(() => scrollY); if (y >= H - 5) break;
    }
    const r = await p.evaluate(() => { const f = window.__f.slice(5); const avg = f.reduce((a, b) => a + b, 0) / f.length; const s = f.slice().sort((a, b) => a - b); return { frames: f.length, fps: +(1000 / avg).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), over50: f.filter(x => x > 50).length, loaf: window.__loaf.length, loafMax: Math.round(Math.max(0, ...window.__loaf)) }; });
    console.log(name, 'scrolled', y, '/', H, JSON.stringify(r));
    await ctx.close();
  }
  await b.close();
})();
