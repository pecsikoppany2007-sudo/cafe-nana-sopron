const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const b = await chromium.launch();
  const o={...devices['Pixel 7']}; delete o.defaultBrowserType; const ctx = await b.newContext(o); const p = await ctx.newPage();
  await p.goto('http://localhost:8766/', { waitUntil: 'load' }); await p.waitForTimeout(4500);
  const sel=process.argv[2]||'#szalon';
  const y0=await p.evaluate(s=>document.querySelector(s).getBoundingClientRect().top+scrollY-innerHeight*1.2,sel);
  await p.evaluate(y=>scrollTo(0,y),Math.max(0,Math.round(y0))); await p.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await b.startTracing(p,{categories:['devtools.timeline','disabled-by-default-devtools.timeline']});
  for(let i=0;i<3;i++) await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 400, yDistance: -600, speed: 1200, repeatCount: 1 });
  const buf=await b.stopTracing();
  const ev=JSON.parse(buf.toString()).traceEvents;
  const agg={};
  ev.filter(e=>e.ph==='X'&&e.dur).forEach(e=>{ if(['Paint','PaintImage','Layout','UpdateLayoutTree','FunctionCall','EvaluateScript','RasterTask','Layerize','PrePaint','CompositeLayers','UpdateLayer','TimerFire','FireAnimationFrame','Commit','Decode Image','ImageDecodeTask','GPUTask','ScrollLayer','HitTest'].includes(e.name)){ agg[e.name]=(agg[e.name]||0)+e.dur; }});
  console.log(sel, Object.entries(agg).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+(v/1000).toFixed(0)+'ms').join(', '));
  await b.close();
})();
