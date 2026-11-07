// v4 ellenőrzés: hibák, túlcsordulás, képkockák a fontos pontokon (saját ellenőrzéshez)
const pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const OUT = __dirname + '/out/'; const URL = process.env.URL || 'http://localhost:8766/';
require('fs').mkdirSync(OUT, { recursive: true });
const fake = () => { const patch = P => { const g = P.getParameter; P.getParameter = function (x) { return x === 0x9246 ? 'ANGLE (Apple, Apple M1, OpenGL 4.1)' : g.call(this, x); }; }; patch(WebGLRenderingContext.prototype); if (window.WebGL2RenderingContext) patch(WebGL2RenderingContext.prototype); };
const go = (p, sel, f) => p.evaluate(([sel, f]) => { const el = document.querySelector(sel); let t = 0, e = el; while (e) { t += e.offsetTop; e = e.offsetParent; } const y = f === undefined ? t : t + (el.offsetHeight - innerHeight) * f; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, [sel, f]);
(async () => {
  const b = await pw.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const devs = (process.env.DEVS || 'desk,iph').split(',');
  const pts = (process.env.PTS || 'top,.free@-.3,#haz@0,#haz@.35,#haz@.7,#szalon@.15,#szalon@.5,#muhely@0,#muhely@.3,#muhely@.75,#torta,#velemenyek,END').split(',');
  for (const dev of devs) {
    const o = dev === 'desk' ? { viewport: { width: 1440, height: 900 } } : { ...pw.devices[dev === 'iph' ? 'iPhone 13' : 'Pixel 7'] }; delete o.defaultBrowserType;
    const c = await b.newContext(o); const p = await c.newPage();
    const errs = []; p.on('pageerror', e => errs.push('ERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CON ' + m.text()); }); p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    if (dev === 'desk') await p.addInitScript(fake);
    if (process.env.LANG2) await p.addInitScript(l => localStorage.setItem('nana-lang', l), process.env.LANG2);
    await p.goto(URL); await p.waitForTimeout(6500);
    console.log(dev, JSON.stringify(await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight }))));
    let k = 0;
    for (const sp of pts) {
      if (sp !== 'top') {
        if (sp === 'END') await p.evaluate(() => { const y = document.documentElement.scrollHeight; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); });
        else { const [sel, f] = sp.split('@'); if (f && f.startsWith('-')) await p.evaluate(([sel, f]) => { const el = document.querySelector(sel); let t = 0, e = el; while (e) { t += e.offsetTop; e = e.offsetParent; } const y = t + innerHeight * +f; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, [sel, f]); else await go(p, sel, f === undefined ? undefined : +f); }
        await p.waitForTimeout(dev !== 'desk' && /haz|szalon|muhely/.test(sp) ? 4500 : 1800);
      }
      await p.screenshot({ path: OUT + `v4-${dev}-${String(k++).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 55 });
    }
    console.log(' errors:', errs.slice(0, 8).join(' | ') || 'none');
    await c.close();
  }
  await b.close();
})();
