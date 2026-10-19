const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const b = await chromium.launch();
  const rate=+(process.argv[2]||6);
  const o={...devices['Pixel 7']}; delete o.defaultBrowserType; const ctx = await b.newContext(o); const p = await ctx.newPage();
  await p.goto('http://localhost:8766/', { waitUntil: 'load' }); await p.waitForTimeout(4500);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await p.evaluate(() => { window.__f = []; let last = performance.now(); (function tick(t) { window.__f.push([t - last, scrollY]); last = t; requestAnimationFrame(tick); })(performance.now()); });
  const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  let y = 0;
  while (y < H) { await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 400, yDistance: -700, speed: 1400, repeatCount: 1 }); y = await p.evaluate(() => scrollY); if (y >= H - 5) break; }
  const r = await p.evaluate(() => {
    const secs=[...document.querySelectorAll('main>section,footer')].map(s=>[s.id||s.tagName, s.getBoundingClientRect().top+scrollY]);
    const agg={};
    window.__f.slice(5).forEach(([d,y])=>{ let n=secs[0][0]; for(const [id,t] of secs) if(y+innerHeight*.5>=t) n=id; (agg[n]=agg[n]||[]).push(d); });
    return Object.entries(agg).map(([k,f])=>k+': n='+f.length+' fps='+(1000/(f.reduce((a,b)=>a+b,0)/f.length)).toFixed(1)+' max='+Math.round(Math.max(...f))+' >34='+f.filter(x=>x>34).length);
  });
  console.log(r.join('\n'));
  await b.close();
})();
