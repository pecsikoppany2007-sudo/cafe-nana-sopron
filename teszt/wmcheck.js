// a nyitókép fotós-jelzése (a teszt-másolaton pirosra festve) látszik-e bárhol a görgetés során
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const {PNG}=(()=>{try{return require('pngjs')}catch(e){return {}}})();
(async()=>{const b=await pw.chromium.launch();
const devs=[['iPhone 13',pw.devices['iPhone 13']],['iPhone SE',pw.devices['iPhone SE']],['Pixel 7',pw.devices['Pixel 7']],['iPhone 14 Pro Max',pw.devices['iPhone 14 Pro Max']],['iPad',pw.devices['iPad (gen 7)']],['iPad land',pw.devices['iPad (gen 7) landscape']],['d1280x720',{viewport:{width:1280,height:720}}],['d1440x900',{viewport:{width:1440,height:900}}],['d1920x1080',{viewport:{width:1920,height:1080}}],['d2560x1440',{viewport:{width:2560,height:1440}}],['d1024x1366',{viewport:{width:1024,height:1366}}]];
for(const [n,o] of devs){
 const oo={...o}; delete oo.defaultBrowserType; const c=await b.newContext(oo); const p=await c.newPage();
 await p.goto(process.env.URL||'http://localhost:8790/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(4800);
 const H=await p.evaluate(()=>document.querySelector('.hero').offsetHeight);
 let hits=[];
 for(let f=0;f<=1.0001;f+=0.05){
  await p.evaluate(y=>scrollTo(0,y),Math.round(H*f)); await p.waitForTimeout(f===0?200:650);
  const red=await p.evaluate(async()=>{ return null; });
  const buf=await p.screenshot();
  const img=await p.evaluate(async (b64)=>{const im=new Image(); im.src='data:image/png;base64,'+b64; await im.decode();
    const cv=document.createElement('canvas'); cv.width=im.width; cv.height=im.height; const x=cv.getContext('2d'); x.drawImage(im,0,0);
    const d=x.getImageData(0,0,cv.width,cv.height).data; let n=0; for(let i=0;i<d.length;i+=16){ if(d[i]>200&&d[i+1]<60&&d[i+2]<60) n++; } return n;}, buf.toString('base64'));
  if(img>20) hits.push(f.toFixed(2)+':'+img);
 }
 console.log(n.padEnd(18), hits.length?('VISIBLE at '+hits.join(' ')):'never visible');
 await c.close();}
await b.close();})();
