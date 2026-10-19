// hero zoom frames + menu peek + DE
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const {chromium,devices}=pw; const OUT=__dirname+'/out/'; const URL='http://localhost:8766/';
(async()=>{
  const b=await chromium.launch();
  for(const dev of ['desk','iph']){
    const o=dev==='desk'?{viewport:{width:1440,height:900}}:{...devices['iPhone 13']}; delete o.defaultBrowserType;
    const ctx=await b.newContext(o); const p=await ctx.newPage(); await p.goto(URL); await p.waitForTimeout(4500);
    const H=await p.evaluate(()=>document.querySelector('.hero').offsetHeight-innerHeight);
    for(const f of [.1,.2,.3,.4,.5,.6]){ await p.evaluate(y=>scrollTo(0,y),Math.round(H*f)); await p.waitForTimeout(800); await p.screenshot({path:OUT+`z-${dev}-${Math.round(f*100)}.png`}); }
    await ctx.close();
  }
  // peek
  const ctx=await b.newContext({viewport:{width:1440,height:900}}); const p=await ctx.newPage(); await p.goto(URL); await p.waitForTimeout(3000);
  await p.evaluate(()=>document.querySelector('#kinalat').scrollIntoView()); await p.waitForTimeout(2500);
  const lis=await p.$$('.menu li[data-peek]'); const res=[];
  for(const [i,li] of lis.entries()){
    await li.scrollIntoViewIfNeeded(); const bb=await li.boundingBox();
    await p.mouse.move(bb.x+bb.width*.4,bb.y+bb.height/2,{steps:4}); await p.waitForTimeout(450);
    const src=await p.evaluate(()=>{const i=document.querySelector('#peek img.is-on');return i&&i.getAttribute('src')});
    const want=await li.getAttribute('data-peek'); res.push((src===want?'OK ':'BAD ')+want.split('/').pop()+' <- '+(src||'').split('/').pop());
    if(i===5) await p.screenshot({path:OUT+'peek.png'});
  }
  console.log(res.join('\n'));
  await ctx.close();
  // DE
  const c2=await b.newContext({viewport:{width:1440,height:900}}); const p2=await c2.newPage();
  await p2.addInitScript(()=>localStorage.setItem('nana-lang','de')); await p2.goto(URL); await p2.waitForTimeout(4500);
  await p2.screenshot({path:OUT+'de-hero.png'});
  for(const s of ['#mentes','#kinalat','#latogatas']){ await p2.evaluate(s=>document.querySelector(s).scrollIntoView(),s); await p2.waitForTimeout(2200); await p2.screenshot({path:OUT+'de-'+s.slice(1)+'.png'}); }
  await b.close();
})();
