// A nyitány alatt mikor esnek ki képkockák (ms a betöltéstől), és mi fut akkor.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const mode = process.argv[2] || 'desktop';
  const b = await chromium.launch();
  let o = mode === 'mobile' ? { ...devices['iPhone 13'] } : { viewport: { width: 1470, height: 800 }, deviceScaleFactor: 2 }; delete o.defaultBrowserType;
  const ctx = await b.newContext(o); const p = await ctx.newPage();
  await b.startTracing(p, { categories: ['cc', 'benchmark', 'devtools.timeline'] });
  await p.goto(process.env.URL || 'http://localhost:8766/', { waitUntil: 'load' });
  await p.waitForTimeout(5500);
  const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents;
  const nav = ev.find(e => e.name === 'navigationStart' || e.name === 'NavigationStart') || ev.find(e => e.name === 'PipelineReporter');
  const t0 = nav.ts;
  const drops = [], rast = {};
  ev.forEach(e => {
    if (e.name === 'PipelineReporter' && e.ph === 'b') { const f = e.args.frame_reporter; if (f && f.frame_type !== 'FORKED' && f.state === 'STATE_DROPPED') drops.push(Math.round((e.ts - t0) / 1000)); }
    if (e.name === 'RasterTask' && e.dur) { const k = Math.floor((e.ts - t0) / 250000) * 250; rast[k] = (rast[k] || 0) + e.dur / 1000; }
    if ((e.name === 'Decode Image' || e.name === 'ImageDecodeTask') && e.dur > 5000) drops.push('decode@' + Math.round((e.ts - t0) / 1000) + ':' + Math.round(e.dur / 1000) + 'ms');
  });
  console.log('drops', drops.join(' '));
  console.log('raster per 250ms', Object.entries(rast).filter(x => x[1] > 20).map(([k, v]) => k + ':' + v.toFixed(0)).join(' '));
  await b.close();
})();
