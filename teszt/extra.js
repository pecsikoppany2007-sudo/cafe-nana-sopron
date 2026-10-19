const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await pw.chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
await p.goto('http://localhost:8766/');await p.waitForTimeout(4000);
const y=await p.evaluate(()=>{const h=document.querySelector('#freeH');return h.getBoundingClientRect().bottom+scrollY-innerHeight*.62});
await p.evaluate(y=>scrollTo(0,y),Math.round(y));await p.waitForTimeout(2500);await p.screenshot({path:__dirname+'/out/mentes-full.png'});
await b.close();})();
