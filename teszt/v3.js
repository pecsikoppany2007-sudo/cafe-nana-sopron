// v3 ellenőrzés: hibák, vízszintes túlcsordulás, görgő (Lenis), menülinkek, képkockák szakaszonként (kontaktlap saját ellenőrzéshez)
// FAKEGPU=1: a videókártya-ellenőrzés valódi kártyát lát (SwiftShaderrel fut a WebGL, a sebesség itt nem mérvadó)
const pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const { chromium, devices } = pw; const OUT = __dirname + '/out/'; const URL = process.env.URL || 'http://localhost:8766/';
require('fs').mkdirSync(OUT, { recursive: true });
const fake = () => {
  const patch = P => { const g = P.getParameter; P.getParameter = function (x) { if (x === 0x9246) return 'ANGLE (Apple, Apple M1, OpenGL 4.1)'; return g.call(this, x); }; };
  patch(WebGLRenderingContext.prototype); if (window.WebGL2RenderingContext) patch(WebGL2RenderingContext.prototype);
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const devs = (process.env.DEVS || 'desk,iph,pix').split(',');
  for (const dev of devs) {
    const o = dev === 'desk' ? { viewport: { width: 1440, height: 900 } } : dev === 'tab' ? { ...devices['iPad Pro 11 landscape'] } : { ...devices[dev === 'iph' ? 'iPhone 13' : 'Pixel 7'] };
    delete o.defaultBrowserType;
    const ctx = await b.newContext(o); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push('ERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CON ' + m.text()); });
    p.on('requestfailed', r => errs.push('FAIL ' + r.url())); p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    if (dev === 'desk' && process.env.FAKEGPU) await p.addInitScript(fake);
    if (process.env.LANG2) await p.addInitScript(l => localStorage.setItem('nana-lang', l), process.env.LANG2);
    await p.goto(URL); await p.waitForTimeout(6500);
    const info = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, cls: document.documentElement.className, lenis: !!window.__lenis }));
    console.log(dev, JSON.stringify(info));
    if (dev === 'desk') {
      const y0 = await p.evaluate(() => scrollY);
      await p.mouse.move(700, 500);
      for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(120); }
      await p.waitForTimeout(1500);
      console.log(' wheel', y0, '->', await p.evaluate(() => scrollY));
    }
    const secs = ['.hero@0', '.hero@.35', '.hero@.75', '#mentes', '#haz@.1', '#haz@.55', '#haz@.85', '#szalon', '#muhely@.1', '#muhely@.6', '#kinalat', '#velemenyek', '#latogatas', 'END'];
    let k = 0;
    for (const sp of secs) {
      const [sel, f] = sp.split('@');
      await p.evaluate(([sel, f]) => {
        let y;
        if (sel === 'END') y = document.documentElement.scrollHeight;
        else { const el = document.querySelector(sel); let t = 0, e = el; while (e) { t += e.offsetTop; e = e.offsetParent; } y = f ? t + (el.offsetHeight - innerHeight) * +f : t; }
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
      }, [sel, f]);
      await p.waitForTimeout(sel === '#haz' && dev !== 'desk' ? 8000 : 2200);
      await p.screenshot({ path: OUT + `${dev}-${String(k++).padStart(2, '0')}.jpg`, quality: 55, type: 'jpeg' });
    }
    // menülinkek: hová érkezik a cím
    if (dev === 'desk') {
      for (const h of ['#haz', '#muhely', '#kinalat', '#latogatas']) {
        await p.evaluate(() => window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)); await p.waitForTimeout(600);
        await p.evaluate(() => { document.getElementById('hd').classList.remove('is-hidden'); });
        await p.click(`.hd__nav a[href="${h}"]`); await p.waitForTimeout(2600);
        const r = await p.evaluate(h => { const s = document.querySelector(h); const t = s.querySelector('h2'); const tb = t ? t.getBoundingClientRect() : null; const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return { y: scrollY, h2top: tb && Math.round(tb.top), mid: el && el.className && String(el.className).slice(0, 30) }; }, h);
        console.log(' link', h, JSON.stringify(r));
      }
    }
    console.log(' errors:', errs.slice(0, 8).join(' | ') || 'none');
    await ctx.close();
  }
  await b.close();
})();
