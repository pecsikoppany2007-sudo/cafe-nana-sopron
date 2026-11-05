// részletek: mélységtérképes nyitókép egérrel, a ház ív-nyitása félúton, gomb egér alatt, kurzor a fotón, mobil menü
const pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const OUT = __dirname + '/out/'; const URL = process.env.URL || 'http://localhost:8766/';
const fake = () => { const patch = P => { const g = P.getParameter; P.getParameter = function (x) { return x === 0x9246 ? 'ANGLE (Apple, Apple M1, OpenGL 4.1)' : g.call(this, x); }; }; patch(WebGLRenderingContext.prototype); if (window.WebGL2RenderingContext) patch(WebGL2RenderingContext.prototype); };
const go = (p, sel, f) => p.evaluate(([sel, f]) => { const el = document.querySelector(sel); let t = 0, e = el; while (e) { t += e.offsetTop; e = e.offsetParent; } const y = t + (el.offsetHeight - innerHeight) * f; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, [sel, f]);
(async () => {
  const b = await pw.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
  await p.addInitScript(fake); await p.goto(URL); await p.waitForTimeout(7000);
  await p.mouse.move(100, 120, { steps: 8 }); await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + 'd-hero-mouse.jpg', type: 'jpeg', quality: 60 });
  await go(p, '.hero', .5); await p.waitForTimeout(1800);
  await p.screenshot({ path: OUT + 'd-hero-mid.jpg', type: 'jpeg', quality: 60 });
  await go(p, '.house', .7); await p.waitForTimeout(1800);
  await p.screenshot({ path: OUT + 'd-house-arch.jpg', type: 'jpeg', quality: 60 });
  await go(p, '#latogatas', 0); await p.waitForTimeout(2000);
  const bb = await (await p.$('.visit__cta .btn--ink')).boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 6 }); await p.waitForTimeout(1200);
  await p.screenshot({ path: OUT + 'd-btn.jpg', type: 'jpeg', quality: 70, clip: { x: bb.x - 60, y: bb.y - 60, width: 420, height: 170 } });
  await go(p, '#szalon', 0); await p.waitForTimeout(1500);
  const fb = await (await p.$('.salon__a')).boundingBox(); await p.mouse.move(fb.x + 300, fb.y + 200, { steps: 6 }); await p.waitForTimeout(900);
  await p.screenshot({ path: OUT + 'd-cur.jpg', type: 'jpeg', quality: 70, clip: { x: fb.x + 200, y: fb.y + 100, width: 220, height: 200 } });
  await c.close();
  const m = await b.newContext({ ...pw.devices['iPhone 13'], defaultBrowserType: undefined }); const q = await m.newPage();
  await q.goto(URL); await q.waitForTimeout(5000); await q.tap('#burger'); await q.waitForTimeout(450);
  await q.screenshot({ path: OUT + 'm-menu-mid.jpg', type: 'jpeg', quality: 60 }); await q.waitForTimeout(1500);
  await q.screenshot({ path: OUT + 'm-menu.jpg', type: 'jpeg', quality: 60 });
  await b.close();
})();
