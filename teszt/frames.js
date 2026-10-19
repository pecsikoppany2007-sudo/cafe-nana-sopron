// Képkocka-kiesés és raszterezési munka mérése Chrome-trace-ből (PipelineReporter), szakaszonként végiggörgetve.
// node frames.js [desktop|mobile] [cpuRate] [url]
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const mode = process.argv[2] || 'desktop', rate = +(process.argv[3] || 1), url = process.argv[4] || 'http://localhost:8766/';
  const b = await chromium.launch();
  let o;
  if (mode === 'mobile') { o = { ...devices['iPhone 13'] }; delete o.defaultBrowserType; }
  else o = { viewport: { width: 1470, height: 800 }, deviceScaleFactor: 2 };
  const ctx = await b.newContext(o); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url, { waitUntil: 'load' });
  const cdp = await ctx.newCDPSession(p);
  const src = mode === 'mobile' ? 'default' : 'mouse';
  const secs = await p.evaluate(() => [...document.querySelectorAll('main>section,footer')].map(s => [s.id || s.className.split(' ')[0], s.getBoundingClientRect().top + scrollY]));
  const secAt = y => { let n = secs[0][0]; for (const [id, t] of secs) if (y + 400 >= t) n = id; return n; };
  const agg = {};
  async function chunk(label, fn) {
    await b.startTracing(p, { categories: ['cc', 'benchmark'] });
    await fn();
    const tr = JSON.parse((await b.stopTracing()).toString()); const ev = tr.traceEvents || tr;
    const a = agg[label] = agg[label] || { st: {}, raster: 0, rn: 0, maxR: 0, miss: 0 };
    ev.forEach(e => {
      if (e.name === 'PipelineReporter' && e.ph === 'b') { const f = e.args && e.args.frame_reporter; if (!f || f.frame_type === 'FORKED' || f.state === 'STATE_NO_UPDATE_DESIRED') return; a.st[f.state] = (a.st[f.state] || 0) + 1; if (f.has_missing_content || f.checkerboarded_needs_raster || f.checkerboarded_needs_record) a.miss++; }
      if (e.name === 'RasterTask' && e.dur) { a.raster += e.dur; a.rn++; a.maxR = Math.max(a.maxR, e.dur); }
    });
  }
  // nyitány
  await chunk('intro', () => p.waitForTimeout(5200));
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  let y = 0, n = 0;
  while (y < H - 5 && n < 120) {
    const lab = secAt(y);
    await chunk(lab, async () => { await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 400, yDistance: -600, speed: 1500, gestureSourceType: src, repeatCount: 1 }); });
    y = await p.evaluate(() => scrollY); n++;
  }
  await chunk('up', async () => { while (y > 5 && n < 240) { await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 400, yDistance: 1500, speed: 4000, gestureSourceType: src, repeatCount: 1 }); y = await p.evaluate(() => scrollY); n++; } });
  await chunk('overscroll', async () => { await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 400, yDistance: 600, speed: 1500, gestureSourceType: src, repeatCount: 2 }); await p.waitForTimeout(600); });
  const pct = (s, k) => { const t = Object.values(s).reduce((a, b) => a + b, 0); return t ? ((s[k] || 0) / t * 100).toFixed(1) : '-'; };
  let T = { st: {}, raster: 0, rn: 0 };
  for (const [k, a] of Object.entries(agg)) {
    const tot = Object.values(a.st).reduce((x, z) => x + z, 0);
    for (const s in a.st) T.st[s] = (T.st[s] || 0) + a.st[s]; T.raster += a.raster; T.rn += a.rn;
    console.log(k.padEnd(11), 'frames', String(tot).padStart(4), 'dropped%', pct(a.st, 'STATE_DROPPED').padStart(5), 'partial%', pct(a.st, 'STATE_PRESENTED_PARTIAL').padStart(5), 'raster ms', (a.raster / 1000).toFixed(0).padStart(5), 'tasks', String(a.rn).padStart(5), 'maxTask ms', (a.maxR / 1000).toFixed(1), 'missing', a.miss); T.miss = (T.miss || 0) + a.miss;
  }
  console.log('TOTAL', mode, 'cpu', rate, 'dropped%', pct(T.st, 'STATE_DROPPED'), 'partial%', pct(T.st, 'STATE_PRESENTED_PARTIAL'), 'raster ms', (T.raster / 1000).toFixed(0), 'missing', T.miss, JSON.stringify(T.st));
  if (errs.length) console.log('ERR', errs);
  await b.close();
})();
