const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
  const b=await pw.chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8766/',{waitUntil:'load'}); await p.waitForTimeout(5000);
  const y=await p.evaluate(()=>{const s=document.querySelector('#muhely');return s.getBoundingClientRect().top+scrollY+s.offsetHeight-innerHeight-4});
  for(let i=1;i<=10;i++){ await p.evaluate(v=>scrollTo(0,v),Math.round(y*i/10)); await p.waitForTimeout(250); }
  await p.waitForTimeout(2000);
  await p.screenshot({path:'out/shopend.png'});
  console.log(await p.evaluate(()=>[...document.querySelectorAll('#shopTrack path[pathLength]')].map(e=>parseFloat(getComputedStyle(e).strokeDashoffset).toFixed(2)).join(' ')), errs.join('\n')||'no errors');
  await b.close();
})();
