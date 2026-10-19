// node shot.js desk|iph|pix [mode]  mode: intro | sections | all
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const {chromium,devices}=pw;
const URL=process.env.URL||'http://localhost:8766/';
const OUT=__dirname+'/out/';
(async()=>{
  const dev=process.argv[2]||'desk', mode=process.argv[3]||'all';
  const b=await chromium.launch();
  const ctxOpt = dev==='desk'?{viewport:{width:1440,height:900}}:dev==='iph'?devices['iPhone 13']:devices['Pixel 7'];
  if(dev!=='desk') delete ctxOpt.defaultBrowserType;
  const ctx=await b.newContext({...ctxOpt, ...(process.env.LANG2?{}:{})});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  if(process.env.DE) await p.addInitScript(()=>localStorage.setItem('nana-lang','de'));
  await p.goto(URL,{waitUntil:'domcontentloaded'});
  const t0=Date.now();
  if(mode==='intro'||mode==='all'){
    for(const t of (process.env.TIMES?process.env.TIMES.split(",").map(Number):[500,1000,1500,2000,2600,3400,4800])){
      const w=t-(Date.now()-t0); if(w>0) await p.waitForTimeout(w);
      await p.screenshot({path:OUT+`${dev}-intro-${t}.png`});
    }
  } else await p.waitForTimeout(5200);
  if(mode==='intro'){ console.log(errs.join('\n')||'no errors'); await b.close(); return; }
  // hero scroll
  const H=await p.evaluate(()=>document.querySelector('.hero').offsetHeight-innerHeight);
  for(const f of [.2,.45,.7,.95]){ await p.evaluate(y=>scrollTo(0,y),Math.round(H*f)); await p.waitForTimeout(900); await p.screenshot({path:OUT+`${dev}-hero-${Math.round(f*100)}.png`}); }
  // sections
  const VH=await p.evaluate(()=>innerHeight);
  const secs=['#mentes','#haz','#szalon','#muhely','#kinalat','#velemenyek','#latogatas','footer'];
  for(const s of secs){
    const y=await p.evaluate(s=>{const e=document.querySelector(s);return e.getBoundingClientRect().top+scrollY},s);
    if(s==='#haz'||s==='#muhely'){
      const hh=await p.evaluate(s=>document.querySelector(s).offsetHeight-innerHeight,s);
      const fr = s==='#haz'?[.1,.3,.45,.58,.85]:[0,.35,.7,1];
      for(const f of fr){ await p.evaluate(y=>scrollTo(0,y),Math.round(y+hh*f)); await p.waitForTimeout(1600); await p.screenshot({path:OUT+`${dev}-${s.slice(1)}-${Math.round(f*100)}.png`}); }
      continue;
    }
    const steps = s==='#kinalat'?3:(s==='#mentes'?2:1);
    for(let i=0;i<steps;i++){
      await p.evaluate(y=>scrollTo(0,y),Math.round(y-60+i*VH*.8)); await p.waitForTimeout(2200);
      await p.screenshot({path:OUT+`${dev}-${s.replace('#','')}-${i}.png`});
    }
  }
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  console.log('overflow',ov); console.log(errs.join('\n')||'no errors');
  await b.close();
})();
