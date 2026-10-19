// node video.js desk|phone  -> webm a scratchpad/vid2 mappába
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const {chromium,devices}=pw;
const OUT=process.env.VOUT||__dirname+'/vid/';
require('fs').mkdirSync(OUT,{recursive:true});
async function glide(p,to,speed){
  await p.evaluate(([to,speed])=>new Promise(res=>{const from=scrollY,d=to-from,dur=Math.max(300,Math.abs(d)/speed*1000),t0=performance.now();
  (function step(t){const k=Math.min(1,(t-t0)/dur);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo(0,from+d*e);k<1?requestAnimationFrame(step):res();})(t0);}),[to,speed]);
}
(async()=>{
  const b=await chromium.launch(); const which=process.argv[2];
  const base=which==='phone'?{...devices['iPhone 13'],recordVideo:{dir:OUT+'phone',size:{width:780,height:1328}}}:{viewport:{width:1440,height:900},recordVideo:{dir:OUT+'desk',size:{width:1440,height:900}}};
  delete base.defaultBrowserType;
  const ctx=await b.newContext(base); const p=await ctx.newPage();
  await p.goto('http://localhost:8766/',{waitUntil:'load'});
  if(which!=='phone') await p.mouse.move(720,450);
  await p.waitForTimeout(5600);
  if(which!=='phone'){ for(let i=0;i<30;i++){ await p.mouse.move(720+Math.sin(i/5)*300,450+Math.cos(i/5)*140); await p.waitForTimeout(60);} }
  const off=s=>p.evaluate(s=>document.querySelector(s).getBoundingClientRect().top+scrollY,s);
  const hgt=s=>p.evaluate(s=>document.querySelector(s).offsetHeight,s);
  const vh=await p.evaluate(()=>innerHeight); const sp=which==='phone'?520:760;
  const heroEnd=await hgt('.hero')-vh;
  await glide(p,heroEnd,sp*.55); await p.waitForTimeout(900);
  await glide(p,await off('#mentes')-vh*.05,sp*.5); await p.waitForTimeout(400);
  await glide(p,await off('#mentes')+vh*(which==='phone'?1.2:.55),sp*.45); await p.waitForTimeout(500);
  const h=await off('#haz'), hH=await hgt('#haz');
  await glide(p,h,sp); await glide(p,h+(hH-vh)*.5,sp*.42); await p.waitForTimeout(700); await glide(p,h+(hH-vh),sp*.5); await p.waitForTimeout(900);
  await glide(p,await off('#szalon')+vh*.15,sp); await p.waitForTimeout(900);
  const s=await off('#muhely'), sH=await hgt('#muhely');
  await glide(p,s,sp); await p.waitForTimeout(500);
  await glide(p,s+sH-vh,sp*(which==='phone'?1:.7)); await p.waitForTimeout(700);
  await glide(p,await off('#kinalat')+(which==='phone'?0:vh*.12),sp); await p.waitForTimeout(1600);
  if(which!=='phone'){
    const items=await p.$$('.menu li[data-peek]');
    for(const it of items.slice(0,9)){ const bb=await it.boundingBox(); if(bb){ await p.mouse.move(bb.x+150,bb.y+bb.height/2,{steps:8}); await p.waitForTimeout(320);} }
    await p.mouse.move(60,120,{steps:6});
  } else { await glide(p,await off('#kinalat')+vh*1.6,sp); await p.waitForTimeout(500); }
  await glide(p,await off('#velemenyek'),sp); await p.waitForTimeout(1500);
  await glide(p,await off('#latogatas')-30,sp); await p.waitForTimeout(1300);
  await glide(p,await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight),sp); await p.waitForTimeout(1800);
  await ctx.close(); await b.close();
})();
