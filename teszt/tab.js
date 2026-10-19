const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await pw.chromium.launch();
for(const [n,vp,touch] of [['tabL',{width:1024,height:768},true],['tabP',{width:768,height:1024},true],['wide',{width:1920,height:1080},false]]){
 const ctx=await b.newContext({viewport:vp,hasTouch:touch,isMobile:false}); const p=await ctx.newPage(); await p.goto('http://localhost:8766/'); await p.waitForTimeout(4600);
 await p.screenshot({path:__dirname+'/out/'+n+'-hero.png'});
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); console.log(n,'overflow',ov); await ctx.close();}
await b.close();})();
