// A kínálat egér melletti képe: soha ne maradjon a képernyőn a kínálaton kívül.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1470, height: 800 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  await p.goto(process.env.URL || 'http://localhost:8766/', { waitUntil: 'load' }); await p.waitForTimeout(5000);
  const op = () => p.evaluate(() => +getComputedStyle(document.getElementById('peek')).opacity);
  const y = await p.evaluate(() => document.querySelector('.menu__cols').getBoundingClientRect().top + scrollY - 200);
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1500);
  const li = await p.evaluate(() => { const r = document.querySelectorAll('.menu li[data-peek]')[1].getBoundingClientRect(); return [r.left + 60, r.top + r.height / 2]; });
  const res = [];
  await p.mouse.move(li[0] - 5, li[1]); await p.mouse.move(li[0], li[1], { steps: 4 }); await p.waitForTimeout(700); res.push(['hover', await op()]);
  // görgetés álló egérrel
  await p.mouse.wheel(0, 500); await p.waitForTimeout(900); res.push(['wheel', await op()]);
  await p.waitForTimeout(800); res.push(['after wheel idle', await op()]);
  // gyors belépés és azonnali görgetés (a régi hiba)
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(600);
  await p.mouse.move(li[0] + 3, li[1] + 2, { steps: 2 }); await p.waitForTimeout(60); await p.mouse.wheel(0, 1600); await p.waitForTimeout(1200); res.push(['enter+scroll', await op()]);
  // nagy görgetés ki a kínálatból
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1200); res.push(['top', await op()]);
  // egér a lista mellé
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(800);
  await p.mouse.move(li[0] + 6, li[1] + 1, { steps: 3 }); await p.waitForTimeout(600); res.push(['hover2', await op()]);
  await p.mouse.move(20, 400, { steps: 6 }); await p.waitForTimeout(700); res.push(['leave', await op()]);
  console.log(res.map(r => r.join('=')).join('  '));
  const ok = res[0][1] > .9 && res[5][1] > .9 && [1, 2, 3, 4, 6].every(i => res[i][1] < .02);
  console.log(ok ? 'PEEK OK' : 'PEEK FAIL');
  await b.close();
})();
