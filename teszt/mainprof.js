// Fő szál költsége név szerint egy görgetési szakaszban: node mainprof.js desktop|mobile rate fromY toY
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const [mode='desktop', rate='4', fromY='0', toY='1200'] = process.argv.slice(2);
  const b = await chromium.launch();
  let o = mode === 'mobile' ? { ...devices['iPhone 13'] } : { viewport: { width: 1470, height: 800 }, deviceScaleFactor: 2 }; delete o.defaultBrowserType;
  const ctx = await b.newContext(o); const p = await ctx.newPage();
  await p.goto(process.env.URL || 'http://localhost:8766/', { waitUntil: 'load' }); await p.waitForTimeout(5200);
  await p.evaluate(y => scrollTo(0, +y), fromY); await p.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: +rate });
  await b.startTracing(p, { categories: ['devtools.timeline', 'blink', 'cc', 'benchmark', 'v8.execute'] });
  await cdp.send('Input.synthesizeScrollGesture', { x: 300, y: 400, yDistance: -(toY - fromY), speed: 1200, gestureSourceType: mode === 'mobile' ? 'default' : 'mouse' });
  await p.waitForTimeout(700);
  const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents;
  const main = ev.find(e => e.name === 'thread_name' && e.args.name === 'CrRendererMain');
  const agg = {}; let st = {};
  ev.forEach(e => {
    if (e.name === 'PipelineReporter' && e.ph === 'b') { const f = e.args.frame_reporter; if (f && f.frame_type !== 'FORKED' && f.state !== 'STATE_NO_UPDATE_DESIRED') st[f.state] = (st[f.state] || 0) + 1; }
    if (!main || e.tid !== main.tid || e.ph !== 'X' || !e.dur) return;
    agg[e.name] = (agg[e.name] || 0) + e.dur;
  });
  console.log(JSON.stringify(st));
  console.log(Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 22).map(([k, v]) => k + ' ' + (v / 1000).toFixed(1)).join('\n'));
  await b.close();
})();
