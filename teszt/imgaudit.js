// Képélesség: minden kép forrásszélessége a megjelenített méret × eszköz-pixelarány arányában (≥1 = éles).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const b = await chromium.launch();
  const vps = [['mac14', { viewport: { width: 1470, height: 800 }, deviceScaleFactor: 2 }], ['fhd', { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }], ['5k', { viewport: { width: 2560, height: 1300 }, deviceScaleFactor: 2 }], ['iph', devices['iPhone 13']], ['iphmax', devices['iPhone 14 Pro Max']], ['pix', devices['Pixel 7']]];
  for (const [n, o] of vps) {
    const opt = { ...o }; delete opt.defaultBrowserType;
    const ctx = await b.newContext(opt); const p = await ctx.newPage();
    await p.goto(process.env.URL || 'http://localhost:8766/', { waitUntil: 'load' }); await p.waitForTimeout(800);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 500) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(120); }
    await p.waitForTimeout(1500);
    // a kínálat egér melletti képei: mind betöltése
    await p.evaluate(() => { const pk = document.querySelectorAll('#peek img'); const li = [...document.querySelectorAll('li[data-peek]')]; li.slice(0, 2).forEach((l, i) => { if (pk[i]) pk[i].src = l.dataset.peek; }); });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => {
      const dpr = devicePixelRatio, out = [];
      const real = {};
      await Promise.all([...document.querySelectorAll('img')].map(im => new Promise(res => { const u = im.currentSrc || im.src; if (!u || real[u]) return res(); const t = new Image(); t.onload = () => { real[u] = [t.naturalWidth, t.naturalHeight]; res(); }; t.onerror = res; t.src = u; })));
      document.querySelectorAll('img').forEach(im => {
        if (!im.naturalWidth) return;
        let w = im.offsetWidth, h = im.offsetHeight;
        if (im.closest('#peek')) { if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return; w = 260; h = 325; }
        if (!w || !h || getComputedStyle(im).display === 'none') return;
        const rr = real[im.currentSrc || im.src]; if (!rr) return; const [nw, nh] = rr, fit = getComputedStyle(im).objectFit;
        const need = fit === 'cover' ? Math.max(w, h * nw / nh) * dpr : w * dpr;
        const name = (im.currentSrc || im.src).split('/').pop().split('?')[0];
        out.push([name, Math.round(need), nw, +(nw / need).toFixed(2)]);
      });
      return out;
    });
    const bad = r.filter(x => x[3] < .97);
    console.log(n, 'images', r.length, 'soft:', bad.length ? bad.map(x => `${x[0]} need ${x[1]} have ${x[2]} (${x[3]})`).join('; ') : 'none');
    await ctx.close();
  }
  await b.close();
})();
