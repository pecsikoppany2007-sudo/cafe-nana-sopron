// a hero görgetésénél a fotó mindig fedje az ív nyílását (a képernyőn belül)
const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const {chromium,devices}=pw;
(async()=>{
  const b=await chromium.launch();
  const vps=[['desk',{viewport:{width:1440,height:900}}],['fhd',{viewport:{width:1920,height:1080}}],['lap',{viewport:{width:1280,height:720}}],['tabP',{viewport:{width:768,height:1024}}],['tabL',{viewport:{width:1024,height:768}}],['iph',devices['iPhone 13']],['pix',devices['Pixel 7']],['se',devices['iPhone SE']]];
  for(const [n,o] of vps){
    const opt={...o}; delete opt.defaultBrowserType;
    const ctx=await b.newContext(opt); const p=await ctx.newPage();
    await p.goto('http://localhost:8766/?debug',{waitUntil:'load'}); await p.waitForTimeout(400);
    const r=await p.evaluate(()=>{
      const H=window.__nana.H, A=H.A, P=H.photo;
      const p2i=u=>u*u, p2o=u=>1-(1-u)*(1-u)*(1-u);
      let worst=1e9, at=0, side='';
      for(let i=0;i<=400;i++){
        const q=i/400, u=Math.min(1,Math.max(0,(q-.06)/.66));
        const S=1+(H.S-1)*p2i(u), k=p2o(u);
        const sc=P.s0.scale+(P.s1.scale-P.s0.scale)*k, x=P.s0.x+(P.s1.x-P.s0.x)*k, y=P.s0.y+(P.s1.y-P.s0.y)*k;
        // nyílás befoglaló téglalapja (a külső vonal 10/16 px-ével), a képernyőre vágva
        const hx0=Math.max(0,A.cx-(A.w/2)*S), hx1=Math.min(H.vw,A.cx+(A.w/2)*S);
        const hy0=Math.max(0,A.cy-(A.cy-A.y)*S), hy1=Math.min(H.vh,A.cy+(A.y+A.h-A.cy)*S);
        const sides=[hx0-x, x+P.Wp*sc-hx1, hy0-y, y+P.Hp*sc-hy1]; const m=Math.min(...sides);
        if(m<worst){worst=m;at=q;side=['L','R','T','B'][sides.indexOf(m)];}
      }
      return {side, worst:Math.round(worst), at:at.toFixed(3), zoom:(1/P.s0.scale).toFixed(2), vw:H.vw, vh:H.vh};
    });
    console.log(n, JSON.stringify(r));
    await ctx.close();
  }
  await b.close();
})();
