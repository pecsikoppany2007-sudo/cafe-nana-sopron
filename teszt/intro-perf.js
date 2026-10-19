const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const {chromium,devices}=pw;
(async()=>{const b=await chromium.launch();
for(const [n,d,r] of [['Pixel7 4x',devices['Pixel 7'],4],['Desktop 4x',{viewport:{width:1440,height:900}},4]]){
 const o={...d}; delete o.defaultBrowserType; const ctx=await b.newContext(o); const p=await ctx.newPage();
 const cdp=await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate',{rate:r});
 await p.addInitScript(()=>{window.__f=[];let l=performance.now();(function t(x){window.__f.push(x-l);l=x;requestAnimationFrame(t)})(l);});
 await p.goto('http://localhost:8766/'); await p.waitForTimeout(6000);
 const res=await p.evaluate(()=>{const f=window.__f.slice(30);const s=f.slice().sort((a,b)=>a-b);return {fps:+(1000/(f.reduce((a,b)=>a+b,0)/f.length)).toFixed(1),p95:+s[Math.floor(s.length*.95)].toFixed(1),over34:f.filter(x=>x>34).length}});
 console.log(n,JSON.stringify(res)); await ctx.close();}
await b.close();})();
