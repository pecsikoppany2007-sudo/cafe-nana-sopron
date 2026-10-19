/* Café Nana v2.4 */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'expo.out', DRAW = 'power2.inOut', FLOW = 'sine.inOut';
const SCRUB = .5;
// rejtett vonal: a „1 1.02” szaggatással így a kerek vonalvég sem hagy pöttyöt a vonal elején vagy végén
const OFF = 1.01;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
// autoRound: false nélkül a GSAP egész pixelre kerekíti a stroke-dashoffsetet, és pathLength=1 mellett
// a vonalak nem kirajzolódnak, hanem félútnál egyszerre felvillannak
gsap.defaults({ ease: EASE, autoRound: false });
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const isMob = () => innerWidth < 900;

/* ---------- Nyelv ---------- */
const DE = {
  'skip':'Zum Inhalt springen','nav.haz':'Das Haus','nav.muhely':'Kuchen','nav.kinalat':'Speisekarte','nav.latogatas':'Kontakt','menu.open':'Menü',
  'hero.h':'Glutenfreie Konditorei in&nbsp;Sopron',
  'hero.p':'Sie finden uns in der József Attila utca, im Eckhaus mit dem Türmchen. Frühstück gibt es auch, und jeden Kuchen können Sie mitnehmen.',
  'hero.b1':'Speisekarte','hero.b2':'Anfahrt',
  'free.aria':'Ohne Gluten, Zucker, Milch und Ei','free.w1':'Gluten,','free.w2':'Zucker,','free.w3':'Milch,','free.w4':'Ei.',
  'free.p1':'Nichts davon kommt in unsere Kuchen. Die Küche ist komplett glutenfrei, auch der Toast und die Bagels zum Frühstück.',
  'free.p2':'Zum Kaffee gibt es Kokos-, Mandel- oder Haferdrink. Wenn Sie auf etwas sehr empfindlich reagieren, fragen Sie an der Theke, wir sagen Ihnen, was in welchem Kuchen steckt.',
  'house.h':'Das Haus','house.p':'Es gehört seit langem unserer Familie und steht unter örtlichem Denkmalschutz.',
  'house.h1':'Damals','house.p1':'Auf einem alten Foto war hier noch ein Gasthaus. An der Fassade stand: „Sass Lajos Rákóczi vendéglője“, Gasthaus Rákóczi von Lajos Sass.',
  'house.h2':'Heute','house.p2':'Café und Konditorei. Beim Einrichten waren die alten Kaffeehäuser der Löwern unser Vorbild.',
  'house.credit':'Zeichnung nach einem alten Foto von sopronanno.hu','house.s0':'Das Haus','house.s1':'Damals','house.s2':'Heute',
  'salon.h':'Der Salon','salon.p':'Drinnen Kamin, Kronleuchter, Fischgrätparkett und weiße Stühle im Louis-seize-Stil. Bei schönem Wetter kann man auch draußen auf der Terrasse sitzen.',
  'shop.h':'Aus der Backstube','shop.p':'Die Backstube liegt unter dem Café, dort backen wir jeden Morgen. Was in die Vitrine kommt, wechselt, die Bilder sind nur Beispiele.',
  'c1':'Kuchen des Tages','c1d':'Es gab schon Zwetschgenkuchen mit Zimt, Kirschkuchen und Mangotorte.',
  'c2':'Krémes','c2d':'Ohne Ei und Milch, was bei einer Cremeschnitte keine Kleinigkeit ist.',
  'c3':'Orangen-Schokoladen-Schnitte','c3d':'Schokoladencreme und Orangengelee, in Schichten.',
  'c4':'Gebäck','c4d':'Wird für den Morgen gebacken, zum Beispiel Nusskipferl.',
  'c5':'Die Theke','c5d':'In der Kühlvitrine stehen auch Desserts im Glas und ganze Torten.',
  'note.h':'Torten auf Bestellung','note.p':'Wir backen auch ganze Torten, zum Geburtstag oder für jeden anderen Anlass. Rufen Sie an, dann besprechen wir, wie sie aussehen soll und bis wann Sie sie brauchen.',
  'menu.h':'Speisekarte','menu.lead':'Nur eine Auswahl, das ganze Tagesangebot sehen Sie an der Theke.',
  'mc1':'Frühstück','mc1t':'ab 7:30','mc2':'Kuchen','mc3':'Getränke',
  'm1':'Eggs Benedict','m1d':'mit Schinken oder Lachs, Sauce hollandaise',
  'm2':'Benedict mit Avocado','m2d':'mit Salat und Cocktailtomaten',
  'm3':'Bagel-Sandwich','m3d':'glutenfreier Bagel mit Gemüse',
  'm4':'Thunfischsalat','m4d':'mit gekochtem Ei, Oliven und Zitrone',
  'm5':'Kuchen des Tages','m5d':'aus der Vitrine',
  'm6':'Krémes','m6d':'der ungarische Klassiker, ohne Ei und Milch',
  'm7':'Orangen-Schokoladen-Schnitte','m7d':'mit Schokoladencreme und Orangengelee',
  'm8':'Gebäck','m8d':'Nusskipferl und Co.',
  'm9':'Tortenbox','m9d':'3, 5 oder 8 gemischte Stücke zum Mitnehmen: 6&nbsp;000, 10&nbsp;000 oder 16&nbsp;000&nbsp;Ft',
  'm10':'Ganze Torte','m10d':'auf Bestellung, vorher telefonisch',
  'm11':'Kaffee','m11d':'hell geröstet, auch mit Pflanzendrink',
  'm12':'Eiskaffee','m12d':'derselbe Kaffee, mit Eis',
  'm13':'Hausgemachte Limonade','m13d':'mit Holunder und Minze',
  'm14':'Zum Mitnehmen','m14d':'Kaffee, Limonade und jeder Kuchen',
  'menu.foot':'Torten und Tortenboxen können Sie telefonisch bestellen: <a href="tel:+36705791598">+36 70 579 1598</a>. Über Wolt können Sie auch nach Hause bestellen.',
  'q1':'„Dieses kleine Schmuckkästchen liegt in Sopron, am Fuß der Löwern.“','q1s':'ittjartam.hu, 2023, aus dem Ungarischen',
  'q2':'„Auch der Toast ist glutenfrei, und der Kirschkuchen wurde ohne Ei und Gluten gebacken. Das Personal ist sehr freundlich.“','q2s':'Restaurant Guru, aus dem Englischen',
  'q3':'„Den besten Eiskaffee habe ich hier getrunken!“','q3s':'magyarvelemeny.com, aus dem Ungarischen',
  'q.rate':'4,6 Sterne bei Google',
  'visit.h':'Kontakt','visit.p':'An der Ecke József Attila utca und Újlaki utca. Kartenzahlung ist möglich.',
  'visit.b1':'Route planen','visit.b2':'Facebook',
  'hours.h':'Öffnungszeiten','d0':'Sonntag','d1':'Montag','d2':'Dienstag','d3':'Mittwoch','d4':'Donnerstag','d5':'Freitag','d6':'Samstag','closed':'geschlossen',
  'ft.c':'© 2026 Café Nana','ft.photo':'Titelbild: Kisklau'
};
const HU = {};
$$('[data-i18n]').forEach(el => { HU[el.dataset.i18n] = el.innerHTML; });
$$('[data-i18n-html]').forEach(el => { HU[el.dataset.i18nHtml] = el.innerHTML; });
$$('[data-i18n-aria]').forEach(el => { HU[el.dataset.i18nAria] = el.getAttribute('aria-label'); });
let lang = 'hu';
try { const s = localStorage.getItem('nana-lang'); if (s === 'de') lang = 'de'; } catch (e) {}

function applyLang(l) {
  lang = l;
  const D = l === 'de' ? DE : HU;
  document.documentElement.lang = l;
  $$('[data-i18n]').forEach(el => { const v = D[el.dataset.i18n]; if (v != null) el.innerHTML = v; });
  $$('[data-i18n-html]').forEach(el => { const v = D[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
  $$('[data-i18n-aria]').forEach(el => { const v = D[el.dataset.i18nAria]; if (v != null) el.setAttribute('aria-label', v); });
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'));
  $$('.split').forEach(splitWords);
  $$('.split.is-in .w>span').forEach(s => gsap.set(s, { yPercent: 0 }));
  hours();
  buildStrikes();
  try { localStorage.setItem('nana-lang', l); } catch (e) {}
}

/* ---------- Szavakra bontás (a címek felúszásához) ---------- */
function splitWords(el) {
  const text = el.textContent.replace(/[ \t\n\r]+/g, ' ').trim();
  el.setAttribute('aria-label', text.replace(/\u00a0/g, ' '));
  el.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
  if (!el.classList.contains('is-in') && !RM) gsap.set($$('.w>span', el), { yPercent: 108 });
}

/* ---------- Nyitvatartás ---------- */
const HOURS = { 0: [7.5, 15], 1: null, 2: [7.5, 17], 3: [7.5, 17], 4: [7.5, 17], 5: [7.5, 18], 6: [7.5, 18] };
const fmt = h => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
const NEXT_HU = ['vasárnap', 'hétfőn', 'kedden', 'szerdán', 'csütörtökön', 'pénteken', 'szombaton'];
const NEXT_DE = ['am Sonntag', 'am Montag', 'am Dienstag', 'am Mittwoch', 'am Donnerstag', 'am Freitag', 'am Samstag'];
function budapestNow() {
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Budapest', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'));
    return { day, h: +g('hour') + (+g('minute')) / 60 };
  } catch (e) { const d = new Date(); return { day: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
}
function hours() {
  const { day, h } = budapestNow();
  $$('#hours tr').forEach(tr => {
    const on = +tr.dataset.d === day;
    tr.classList.toggle('is-today', on);
    const th = $('th', tr);
    if (on) th.dataset.today = lang === 'de' ? 'heute' : 'ma'; else delete th.dataset.today;
  });
  const t = HOURS[day];
  let short, long;
  if (t && h >= t[0] && h < t[1]) {
    short = lang === 'de' ? `<b>Jetzt geöffnet</b>, bis ${fmt(t[1])} Uhr` : `<b>Most nyitva</b>, ${fmt(t[1])}-ig várjuk`;
    long = short + '.';
  } else if (t && h < t[0]) {
    short = lang === 'de' ? `<b>Heute ab ${fmt(t[0])} Uhr geöffnet</b>` : `<b>Ma ${fmt(t[0])}-kor nyitunk</b>`;
    long = short + '.';
  } else {
    let n = 1; while (!HOURS[(day + n) % 7]) n++;
    const nd = (day + n) % 7, o = fmt(HOURS[nd][0]);
    short = lang === 'de' ? `<b>Jetzt geschlossen</b>, wieder ${n === 1 ? 'morgen' : NEXT_DE[nd]} ab ${o} Uhr` : `<b>Most zárva</b>, ${n === 1 ? 'holnap' : NEXT_HU[nd]} ${o}-kor nyitunk`;
    long = short + '.';
  }
  const hn = $('#heroNow'); if (hn) hn.innerHTML = short;
  const hw = $('#hoursNow'); if (hw) hw.innerHTML = long;
}

/* ---------- Ív (a hagymakupola sziluettje) ---------- */
function archHalves(x, y, w, h) {
  const s = Math.min(h * 0.34, w * 0.62);
  const L = `M${x} ${y + h}L${x} ${y + s}C${x} ${y + s * .42} ${x + w * .30} ${y + s * .36} ${x + w * .41} ${y + s * .17}C${x + w * .465} ${y + s * .07} ${x + w * .49} ${y + s * .025} ${x + w * .5} ${y}`;
  const R = `M${x + w} ${y + h}L${x + w} ${y + s}C${x + w} ${y + s * .42} ${x + w * .70} ${y + s * .36} ${x + w * .59} ${y + s * .17}C${x + w * .535} ${y + s * .07} ${x + w * .51} ${y + s * .025} ${x + w * .5} ${y}`;
  const full = `M${x} ${y + h}L${x} ${y + s}C${x} ${y + s * .42} ${x + w * .30} ${y + s * .36} ${x + w * .41} ${y + s * .17}C${x + w * .465} ${y + s * .07} ${x + w * .49} ${y + s * .025} ${x + w * .5} ${y}C${x + w * .51} ${y + s * .025} ${x + w * .535} ${y + s * .07} ${x + w * .59} ${y + s * .17}C${x + w * .70} ${y + s * .36} ${x + w} ${y + s * .42} ${x + w} ${y + s}L${x + w} ${y + h}Z`;
  return { L, R, full, s };
}
/* kovácsoltvas kacskaringó, (x,y) a talppont, dir 1 = jobbra */
function curl(x, y, k, dir) {
  const P = (px, py) => `${x + dir * px * k} ${y + (py - 34) * k}`;
  return `M${P(0, 34)}C${P(22, 34)} ${P(30, 20)} ${P(44, 14)}C${P(58, 8)} ${P(70, 14)} ${P(70, 24)}C${P(70, 32)} ${P(61, 35)} ${P(56, 30)}C${P(52, 26)} ${P(56, 20)} ${P(61, 22)}`;
}

/* ---------- Belépő ---------- */
const stage = $('#heroStage');
const H = {};
function heroLayout() {
  const vw = stage.clientWidth, vh = stage.clientHeight, mob = vw < 900;
  const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || Math.max(20, Math.min(64, vw * .05));
  let top, Ha, Wa;
  if (!mob) {
    top = Math.max(150, vh * .175);
    Ha = vh - top - Math.max(52, vh * .075);
    Wa = Math.min(Ha * .6, vw * .32);
  } else {
    top = 118;
    Ha = Math.max(240, Math.min(vh * .45, (vw - pad * 2) * 1.3));
    Wa = Math.min(Ha * .68, vw - pad * 2 - 48);
  }
  const A = { x: (vw - Wa) / 2, y: top, w: Wa, h: Ha };
  A.cx = A.x + Wa / 2; A.cy = A.y + Ha / 2;
  const g = archHalves(A.x, A.y, Wa, Ha);
  const o = archHalves(A.x - 10, A.y - 16, Wa + 20, Ha + 16);
  Object.assign(H, { vw, vh, A, mob });

  // az ív belseje: a hosszú görgetés alatt ez a vágóút nő képernyőnyire (nem egy felnagyított réteg)
  H.arch = (k) => {
    const w = Wa * k, h = Ha * k;
    return archHalves(A.cx - w / 2, A.cy - Ha / 2 * k, w, h);
  };
  H.archO = (k) => {
    const w = (Wa + 20) * k, h = (Ha + 16) * k;
    return archHalves(A.cx - w / 2, A.cy - (Ha / 2 + 16) * k, w, h);
  };

  // vonalak
  const ls = $('#heroLines');
  ls.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  $('#hlL').setAttribute('d', g.L); $('#hlR').setAttribute('d', g.R);
  $('#hlL2').setAttribute('d', o.L); $('#hlR2').setAttribute('d', o.R);
  // a csúcsdísz fentről lefelé rajzolódik: a logó alól csöppen le az arany
  const fy = A.y - 16, ft = fy - (mob ? 30 : 44);
  $('#hlFin').setAttribute('d', `M${A.cx} ${ft}V${fy - 18}A4 4 0 1 0 ${A.cx} ${fy - 10}A4 4 0 1 0 ${A.cx} ${fy - 18}M${A.cx} ${fy - 10}V${fy}`);
  const by = A.y + Ha, fm = mob ? 12 : 24, lg = mob ? 34 : 50;
  const fr = mob ? 12 : 18;
  $('#hlGl').setAttribute('d', `M${A.x - 10} ${by}H${fm + fr}A${fr} ${fr} 0 0 0 ${fm} ${by - fr}V${fm + fr}A${fr} ${fr} 0 0 0 ${fm + fr} ${fm}H${A.cx - lg}`);
  $('#hlGr').setAttribute('d', `M${A.x + Wa + 10} ${by}H${vw - fm - fr}A${fr} ${fr} 0 0 1 ${vw - fm} ${by - fr}V${fm + fr}A${fr} ${fr} 0 0 1 ${vw - fm - fr} ${fm}H${A.cx + lg}`);
  const k = mob ? .62 : 1.05;
  const cl = $('#hlCl'), cr = $('#hlCr');
  if (cl.tagName.toLowerCase() === 'use') {
    const gC = $('#hlCurls'); gC.innerHTML = '';
    gC.append(svgEl('path', { class: 'hl hl--c', id: 'hlCl', pathLength: 1 }), svgEl('path', { class: 'hl hl--c', id: 'hlCr', pathLength: 1 }));
  }
  $('#hlCl').setAttribute('d', curl(A.x - 18, by, k, -1));
  $('#hlCr').setAttribute('d', curl(A.x + Wa + 18, by, k, 1));

  // fotó: a végén pontosan kitölti a képernyőt (felskálázott forrásból, élesen),
  // induláskor az ív egy részletet mutat belőle; a teljes nagyítás legfeljebb 1,6-szoros
  const Wp = Math.max(vw, vh * .8) * (vw < vh ? 1.2 : 1.03), Hp = Wp * 1.25;
  // az ív a kép felső 88%-án belül maradjon (alul a fotós jelzése van, az ne kerüljön az ívbe)
  const k0 = Math.min(1, Math.max(Wa / ((mob ? .62 : .5) * Wp), 1 / (mob ? 1.6 : 1.8), (Ha + 44) / (.88 * Hp)));
  // az ív a nyitott ajtót keretezi: csillár, vitrin, elöl a gyertya
  const px = .5, py = mob ? .42 : .36, mg = 14, pw = k0 * Wp, ph0 = k0 * Hp;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  H.photo = {
    Wp, Hp,
    s0: { x: clamp(A.cx - pw * px, A.x + Wa + mg - pw, A.x - mg), y: clamp(A.cy - ph0 * py, A.y + Ha + mg - ph0 * .88, A.y - 16 - mg), scale: k0 },
    s1: { x: clamp(vw / 2 - Wp * .5, vw - Wp, 0), y: clamp(vh / 2 - Hp * (vw < vh ? .34 : .37), vh - Hp, vw < vh ? -40 : 0), scale: 1 }
  };
  // a kép maga a réteg (keret, háttér nélkül), így a böngésző a saját felbontásán tartja, és a nagyítás nem raszterez újra
  const im = $('#heroImg');
  Object.assign(im.style, { width: Wp + 'px', height: Hp + 'px' });

  // függöny az intróhoz: puha, áttetsző felső éllel csúszik le, ahogy az arany lefolyik az íven
  const fth = Math.round(Ha * .32);
  stage.style.setProperty('--fth', fth + 'px');
  Object.assign($('#heroCur').style, { left: A.x - 16 + 'px', top: A.y - 30 - fth + 'px', width: Wa + 32 + 'px', height: Ha + 60 + fth + 'px' });
  H.curY = Ha + 60 + fth;
  H.finY = A.y - 16;

  // végső nagyítás: a nyílás egyenes része fedje a képernyőt
  const sh = A.y + g.s;
  H.S = 1.06 * Math.max(2 * Math.max(A.cx, vw - A.cx) / Wa, A.cy / Math.max(1, A.cy - sh), (vh - A.cy) / (Ha / 2));
  // eddig követik a vonalak az ívet (utána már átlátszók)
  H.sL = 1 + (H.S - 1) * .2;
  H.lastS = H.lastL = -1;

  // szövegoszlopok
  const root = stage.style;
  if (!mob) {
    const gap = Math.max(36, vw * .04);
    root.setProperty('--colw', Math.max(220, (vw - Wa) / 2 - pad - gap) + 'px');
    root.setProperty('--hb', (vh - by + 30) + 'px');
  } else {
    root.setProperty('--ht', (by + 26) + 'px');
    root.setProperty('--hh', $('#heroH').offsetHeight + 'px');
  }
  heroRender();
}

const NAVS = '.hd__nav, .hd__tel, .hd__tools, #burger';
/* Z.s: az ablak nagyítása, Z.p: a fotó útja a végső helyéig (0..1), Z.k: a nyitány lassú „leülése” */
const Z = { s: 1, p: 0, k: 1 };
function heroRender() {
  const P = H.photo; if (!P) return;
  const A = H.A, p = Z.p, k = Z.k;
  let x = P.s0.x + (P.s1.x - P.s0.x) * p, y = P.s0.y + (P.s1.y - P.s0.y) * p;
  const sc = (P.s0.scale + (1 - P.s0.scale) * p) * k;
  if (k !== 1) { x = A.cx - (A.cx - x) * k; y = A.cy - (A.cy - y) * k; }
  $('#heroImg').style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${sc.toFixed(5)})`;
  if (Z.s !== H.lastS) {
    H.lastS = Z.s;
    $('#heroWin').style.clipPath = Z.s >= H.S - 1e-3 ? 'none' : `path('${H.arch(Z.s).full}')`;
    if (Z.s <= H.sL || H.lastL !== H.sL) {
      const t = Math.min(Z.s, H.sL), g = H.arch(t), o = H.archO(t);
      $('#hlL').setAttribute('d', g.L); $('#hlR').setAttribute('d', g.R);
      $('#hlL2').setAttribute('d', o.L); $('#hlR2').setAttribute('d', o.R);
      $('#hlFin').setAttribute('transform', `translate(0 ${((H.A.cy - (H.A.cy - H.finY) * t) - H.finY).toFixed(2)})`);
      H.lastL = t === H.sL ? H.sL : -1;
    }
  }
}
function heroPrep() {
  gsap.set(['#hlFin', '#hlGl', '#hlGr', '#hlCl', '#hlCr'], { strokeDashoffset: OFF });
  gsap.set(['#hlL', '#hlR', '#hlL2', '#hlR2'], { strokeDashoffset: -OFF });
  gsap.set('#heroCur', { y: 0, autoAlpha: 1 });
  Z.k = 1.07; heroRender();
  gsap.set('#heroR > *', { opacity: 0, y: 16 });
  gsap.set('.hd__logo', { opacity: 0, y: -8 });
  gsap.set(NAVS, { opacity: 0 });
}
/* A nyitány egyetlen folyó vonal: a logó alól lecsöppen a csúcsdíszre, két ágban lefolyik
   a kupola ívén (közben előtűnik a kép), a talpon kifelé fut a kacskaringókkal, felkúszik a
   keret oldalán, és fent visszaér a logóhoz. A szakaszok sebessége a csatlakozásoknál egyezik. */
function heroIntro() {
  const words = $$('#heroH .w>span');
  const L1 = $('#hlL2').getTotalLength(), L2 = $('#hlGl').getTotalLength();
  const T1 = 1.05, T2 = gsap.utils.clamp(1.6, 2.9, T1 * L2 / Math.max(1, L1));
  const t1 = .72, t2 = t1 + T1;
  const tl = gsap.timeline({ delay: .1 });
  tl.to('.hd__logo', { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 0)
    .to('#hlFin', { strokeDashoffset: 0, duration: .5, ease: 'power1.in' }, .3)
    .to(['#hlL2', '#hlR2'], { strokeDashoffset: 0, duration: T1, ease: 'power1.in' }, t1)
    .to(['#hlL', '#hlR'], { strokeDashoffset: 0, duration: T1 * 1.1, ease: 'power1.in' }, t1 + .14)
    .to('#heroCur', { y: () => H.curY, duration: T1 * 1.3, ease: 'power1.in', onComplete: () => gsap.set('#heroCur', { autoAlpha: 0 }) }, t1 + .04)
    .to(Z, { k: 1, duration: 2.8, ease: 'expo.out', onUpdate: heroRender }, t1 + .25)
    .to(['#hlGl', '#hlGr'], { strokeDashoffset: 0, duration: T2, ease: 'power1.out' }, t2)
    .to(['#hlCl', '#hlCr'], { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out' }, t2 + .04)
    .to(words, { yPercent: 0, duration: 1.25, stagger: .055 }, t2 - .1)
    .to('#heroR > *', { opacity: 1, y: 0, duration: 1.1, stagger: .09 }, t2 + .25)
    .to(NAVS, { opacity: 1, duration: 1, ease: 'power2.out', stagger: .06 }, t2 + T2 * .5)
    .add(() => { $('#heroH').classList.add('is-in'); gsap.set(['.hd__logo', NAVS, '#heroR > *'], { clearProps: 'opacity,transform' }); gsap.set(words, { clearProps: 'transform' }); }, Math.max(t2 + T2, t1 + 3.1));
  return tl;
}

let heroST;
function heroScroll() {
  if (heroST) { heroST.kill(); heroST.animation && heroST.animation.kill(); }
  const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: heroRender });
  tl.to('#heroL', { x: () => -Math.min(90, H.vw * .06), opacity: 0, duration: .26 }, 0)
    .to('#heroR', { x: () => Math.min(90, H.vw * .06), opacity: 0, duration: .26 }, 0)
    .to(['#hlGl', '#hlGr', '#hlCl', '#hlCr'], { opacity: 0, duration: .14 }, 0)
    .fromTo(Z, { s: 1 }, { s: () => H.S, duration: .66, ease: 'power2.in' }, .06)
    .fromTo(Z, { p: 0 }, { p: 1, duration: .66, ease: 'power3.out' }, .06)
    .fromTo('#heroLines', { opacity: 1 }, { opacity: 0, duration: .22 }, .1)
    .to({}, { duration: .12 });
  heroST = ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: SCRUB, animation: tl, invalidateOnRefresh: true });
}

/* Rajzolás közben a vonal saját rétegre kerül: a változása így csak a vékony vonalat festi újra,
   nem az alatta lévő fényképet. Utána visszakerül a lapra, hogy ne foglaljon memóriát. */
function live(els) {
  const L = [].concat(els); let t;
  return { onToggle: st => { clearTimeout(t); if (st.isActive) L.forEach(e => e.classList.add('is-live')); else t = setTimeout(() => L.forEach(e => e.classList.remove('is-live')), 900); } };
}

/* ---------- Áthúzott szavak ---------- */
let strikeST;
function rnd(i) { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); }
function buildStrikes() {
  const h = $('#freeH'); if (!h) return;
  const fs = parseFloat(getComputedStyle(h).fontSize);
  $$('.strike', h).forEach((sp, i) => {
    $$('svg', sp).forEach(s => s.remove());
    const w = sp.offsetWidth, hh = sp.offsetHeight;
    const y = hh * .56, x0 = -w * .05, x1 = w * 1.04;
    const a = (rnd(i) - .5) * fs * .1, b = (rnd(i + 7) - .5) * fs * .12, tilt = (rnd(i + 3) - .6) * fs * .08;
    const d = `M${x0} ${y + tilt}C${x0 + (x1 - x0) * .3} ${y + a} ${x0 + (x1 - x0) * .62} ${y + b} ${x1} ${y - tilt}`;
    const s = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}`, 'aria-hidden': 'true' });
    s.style.strokeWidth = Math.max(2, fs * .032) + 'px';
    const p = svgEl('path', { d, pathLength: 1 });
    p.style.strokeDashoffset = OFF;
    s.append(p); sp.append(s);
  });
  if (strikeST) { strikeST.kill(); strikeST.animation && strikeST.animation.kill(); }
  const paths = $$('.strike path', h);
  if (RM) { paths.forEach(p => p.style.strokeDashoffset = 0); return; }
  const tl = gsap.timeline();
  paths.forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: 1.2, ease: FLOW }, i * .8));
  strikeST = ScrollTrigger.create(Object.assign({ trigger: h, start: 'top 80%', end: 'bottom 64%', scrub: SCRUB, animation: tl }, live($$('.strike svg', h))));
}

/* ---------- Keretek ---------- */
function frameGeom(f) {
  const inr = $('.frame__in', f); if (!inr) return;
  const w = inr.offsetWidth, h = inr.offsetHeight, d = 11;
  let s = $('.frame__svg', f);
  if (!s) {
    s = svgEl('svg', { class: 'frame__svg', 'aria-hidden': 'true' });
    s.append(svgEl('path', { pathLength: 1 }), svgEl('path', { pathLength: 1 }));
    f.append(s);
  }
  const W = w + d * 2, Hh = h + d * 2, c = W / 2, e = .5;
  s.setAttribute('width', W); s.setAttribute('height', Hh); s.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  const [a, b] = $$('path', s);
  a.setAttribute('d', `M${c} ${e}H${W - e}V${Hh - e}H${c}`);
  b.setAttribute('d', `M${c} ${e}H${e}V${Hh - e}H${c}`);
}
function setupFrames(container) {
  $$('.frame').forEach(f => {
    frameGeom(f);
    const inr = $('.frame__in', f), svg = $('.frame__svg', f);
    let cur = $('.frame__cur', inr);
    if (!cur) { cur = document.createElement('div'); cur.className = 'frame__cur'; inr.append(cur); }
    const paths = $$('path', svg);
    if (RM) { gsap.set(paths, { strokeDashoffset: 0 }); cur.remove(); return; }
    const inShop = container && f.closest('#shopTrack') && !isMob();
    const early = inShop && f.getBoundingClientRect().left < innerWidth * .9;
    // a keret vonala a görgetéssel együtt nő körbe a kép körül
    const draw = gsap.fromTo(paths, { strokeDashoffset: OFF }, { strokeDashoffset: 0, ease: FLOW });
    ScrollTrigger.create(Object.assign({ trigger: early ? '.shop' : f, animation: draw, scrub: SCRUB },
      early ? { start: 'top 82%', end: 'top top' } : inShop ? { containerAnimation: container, start: 'left 100%', end: shopEnd(f, 38) } : { start: 'top 96%', end: 'center 42%' }, live(svg)));
    // a kép egyszer, a saját tempójában tűnik elő: a papírszínű függöny lefelé húzódik róla
    ScrollTrigger.create(Object.assign({ trigger: early ? '.shop' : f, once: true, onEnter: () => gsap.to(cur, { scaleY: 0, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.inOut' }) },
      early ? { start: 'top 55%' } : inShop ? { containerAnimation: container, start: 'left 92%' } : { start: 'top 86%' }));
  });
}

/* a vízszintes sor végén álló elemek nem érnek el a képernyő közepéig:
   a rajzolás vége ott legyen, ahová a sor végén még eljutnak */
function shopEnd(el, want) {
  return () => {
    const track = $('#shopTrack'), dist = Math.max(0, track.scrollWidth - innerWidth);
    const rel = el.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const fin = (rel - dist) / innerWidth * 100;
    return `left ${Math.min(96, Math.max(want, Math.ceil(fin) + 4))}%`;
  };
}

/* ---------- Kartus (a logó kerete) ---------- */
function cartGeom(el) {
  const s = $('.cart__svg', el); if (!s) return;
  const w = el.offsetWidth, h = el.offsetHeight;
  const crown = el.hasAttribute('data-crown');
  const r = Math.max(16, Math.min(30, w * .03)), d = 7, e = .5;
  s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const gap = crown ? 64 : 0, c = w / 2;
  // külső vonal, két fél: fent középről lefelé, alul középen találkoznak
  const half = (dir, inset) => {
    const x0 = dir > 0 ? w - e - inset : e + inset, R = r + inset, k = Math.sqrt(Math.max(0, R * R - inset * inset));
    const xs = dir > 0 ? c + gap : c - gap;
    const top = inset + e, bot = h - e - inset;
    const cxT = dir > 0 ? w : 0;
    const sweep = dir > 0 ? 0 : 1;
    return `M${xs} ${top}H${cxT - dir * k}A${R} ${R} 0 0 ${sweep} ${x0} ${k}V${h - k}A${R} ${R} 0 0 ${sweep} ${cxT - dir * k} ${bot}H${c}`;
  };
  let paths = $$('path', s);
  const need = crown ? 6 : 4;
  if (paths.length !== need) {
    s.innerHTML = '';
    if (el.classList.contains('menu__card')) s.append(svgEl('path', { class: 'cart__fill' }));
    for (let i = 0; i < 4; i++) s.append(svgEl('path', { class: i < 2 ? 'cart__a' : 'cart__b', pathLength: 1 }));
    if (crown) s.append(svgEl('path', { class: 'cart__crown', pathLength: 1 }));
    paths = $$('path', s);
  }
  const P = $$('path[pathLength]', s);
  P[0].setAttribute('d', half(1, 0)); P[1].setAttribute('d', half(-1, 0));
  P[2].setAttribute('d', half(1, d)); P[3].setAttribute('d', half(-1, d));
  const fill = $('.cart__fill', s);
  if (fill) {
    const k = r;
    fill.setAttribute('d', `M${k} 0H${w - k}A${r} ${r} 0 0 0 ${w} ${k}V${h - k}A${r} ${r} 0 0 0 ${w - k} ${h}H${k}A${r} ${r} 0 0 0 0 ${h - k}V${k}A${r} ${r} 0 0 0 ${k} 0Z`);
  }
  if (crown) {
    const y = 4, cs = 1.35, X = (px) => c + px * cs, Y = (py) => y + py * cs;
    const cr = `M${X(-34)} ${Y(0)}H${X(34)}M${X(-31)} ${Y(-6)}H${X(31)}M${X(-31)} ${Y(-6)}L${X(-38)} ${Y(-27)}C${X(-31)} ${Y(-24)} ${X(-26)} ${Y(-20)} ${X(-22)} ${Y(-13)}C${X(-20)} ${Y(-22)} ${X(-16)} ${Y(-29)} ${X(-11)} ${Y(-31)}C${X(-9)} ${Y(-24)} ${X(-6)} ${Y(-18)} ${X(-4)} ${Y(-14)}C${X(-3)} ${Y(-25)} ${X(-1)} ${Y(-33)} ${X(0)} ${Y(-37)}C${X(1)} ${Y(-33)} ${X(3)} ${Y(-25)} ${X(4)} ${Y(-14)}C${X(6)} ${Y(-18)} ${X(9)} ${Y(-24)} ${X(11)} ${Y(-31)}C${X(16)} ${Y(-29)} ${X(20)} ${Y(-22)} ${X(22)} ${Y(-13)}C${X(26)} ${Y(-20)} ${X(31)} ${Y(-24)} ${X(38)} ${Y(-27)}L${X(31)} ${Y(-6)}M${X(-2.5)} ${Y(-41)}A2.5 2.5 0 1 0 ${X(2.5)} ${Y(-41)}A2.5 2.5 0 1 0 ${X(-2.5)} ${Y(-41)}`;
    $('.cart__crown', s).setAttribute('d', cr);
  }
}
function setupCarts(container) {
  $$('[data-cart]').forEach(el => {
    cartGeom(el);
    const s = $('.cart__svg', el);
    const outer = $$('.cart__a', s), inner = $$('.cart__b', s), crown = $('.cart__crown', s), fill = $('.cart__fill', s);
    const all = [...outer, ...inner, crown].filter(Boolean);
    if (RM) { gsap.set(all, { strokeDashoffset: 0 }); return; }
    gsap.set(all, { strokeDashoffset: OFF });
    // a korona után a két ág a görgetéssel együtt folyik le a kartus két oldalán, és alul összeér
    const tl = gsap.timeline({ defaults: { ease: FLOW } });
    let t = 0;
    if (crown) { tl.to(crown, { strokeDashoffset: 0, duration: .45 }, 0); t = .3; }
    tl.to(outer, { strokeDashoffset: 0, duration: 1 }, t)
      .to(inner, { strokeDashoffset: 0, duration: 1 }, t + .12);
    const inShop = container && el.closest('#shopTrack') && !isMob();
    const big = el.classList.contains('menu__card');
    ScrollTrigger.create(Object.assign({ trigger: el, animation: tl, scrub: SCRUB },
      inShop ? { containerAnimation: container, start: 'left 100%', end: shopEnd(el, 42) } : big ? { start: 'top 92%', end: 'top 12%' } : { start: 'top 94%', end: 'center 48%' }, live(s)));
    if (fill) {
      gsap.set(fill, { opacity: 0 });
      ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true, onEnter: () => gsap.to(fill, { opacity: 1, duration: 1.6, ease: 'power2.out' }) });
    }
  });
}

/* ---------- Díszvonal elválasztók ---------- */
function setupOrns() {
  $$('.orn').forEach(o => {
    const c = $$('.orn__c', o), s = $$('.orn__s', o);
    o.style.strokeWidth = (1.15 * 600 / Math.max(200, o.getBoundingClientRect().width)) + 'px';
    if (RM) { gsap.set([...c, ...s], { strokeDashoffset: 0 }); return; }
    gsap.set([...c, ...s], { strokeDashoffset: OFF });
    const tl = gsap.timeline({ defaults: { ease: FLOW } });
    tl.to(c, { strokeDashoffset: 0, duration: .5 }, 0).to(s, { strokeDashoffset: 0, duration: 1 }, .32);
    ScrollTrigger.create(Object.assign({ trigger: o, animation: tl, scrub: SCRUB, start: 'top 97%', end: 'top 58%' }, live(o)));
  });
}

/* ---------- A ház ---------- */
const VILLA = `<path pathLength="1" d="M140 745H988"/>
<path pathLength="1" d="M352 700H600M600 698H982"/>
<path pathLength="1" d="M770 541H984M600 550H984M600 561H984"/>
<path pathLength="1" d="M600 550V745M984 541V745"/>
<path pathLength="1" d="M634 738V593H662V738"/>
<path pathLength="1" d="M697 700V597H728V700ZM712 597V700M697 630H728M691 706H734"/>
<path pathLength="1" d="M813 703V602H843V703ZM828 602V703M813 635H843M807 709H849"/>
<path pathLength="1" d="M899 703V606H929V703ZM914 606V703M899 638H929M893 709H935"/>
<path pathLength="1" d="M207 700V615H222V700"/>
<path pathLength="1" d="M256 680V612H276V680ZM266 612V680M256 630H276"/>
<path pathLength="1" d="M289 676V604H303V676Z"/>
<path pathLength="1" d="M325 670V588H345V670ZM335 588V670M325 607H345"/>
<path pathLength="1" d="M150 580V745M206 562V745"/>
<path pathLength="1" d="M482 368C510 377 540 388 562 394"/>
<path pathLength="1" d="M566 397L704 455L696 470L760 534"/>
<path pathLength="1" d="M592 546H770"/>
<path pathLength="1" d="M300 432L210 478"/>
<path pathLength="1" d="M150 566L300 548M300 548L345 533"/>
<path pathLength="1" d="M152 580C153 540 156 500 162 474C166 460 172 450 182 447C191 448 196 456 199 468C203 490 205 530 206 562"/>
<path pathLength="1" d="M168 690V612H186V690ZM177 612V690"/>
<path pathLength="1" d="M302 530C303 500 304 470 307 448C309 428 316 410 324 400C329 393 333 390 338 391C345 393 349 399 352 410"/>
<path pathLength="1" d="M324 522V478A8 8 0 0 1 340 478V522Z"/>
<path pathLength="1" d="M488 528C490 500 492 470 495 445C497 428 503 416 510 406C518 394 525 384 538 382C552 381 560 389 566 399C574 413 581 432 585 452C588 476 590 500 592 528"/>
<path pathLength="1" d="M502 512C503 486 505 462 508 446C511 432 516 421 523 412C529 405 533 400 539 399C546 399 551 404 556 412C563 424 568 440 571 458C574 478 576 496 577 512" class="vl-fine"/>
<circle pathLength="1" cx="496" cy="510" r="5"/><circle pathLength="1" cx="589" cy="515" r="5"/>
<path pathLength="1" d="M520 665V592H562V665ZM534 592V665M548 592V665M520 615H562M515 670H567"/>
<path pathLength="1" d="M527 515V471A13 13 0 0 1 553 471V515ZM540 458V515M527 488H553"/>
<path pathLength="1" d="M368 514H466L486 530M368 514L345 530H486"/>
<path pathLength="1" d="M352 538Q415 548 484 540"/>
<path pathLength="1" d="M360 545V700M482 542V700"/>
<path pathLength="1" d="M381 664V586H411V664ZM396 586V664M381 609H411M376 668H416"/>
<path pathLength="1" d="M429 662V586H446V662ZM429 609H446M425 666H450"/>
<path pathLength="1" d="M352 427Q415 421 478 427M350 434Q415 428 480 434M356 440Q415 435 474 440"/>
<path pathLength="1" d="M363 440V514M468 440V514"/>
<path pathLength="1" d="M385 510V449H415V510ZM400 449V510M385 470H415"/>
<path pathLength="1" d="M436 510V449H454V510ZM436 470H454"/>
<path pathLength="1" d="M471 372V349H483V372"/>
<path pathLength="1" d="M412 306C396 314 371 326 362 349C353 371 359 397 380 412M418 306C434 314 459 326 468 349C477 371 471 397 450 412"/>
<path pathLength="1" d="M415 309C405 330 398 360 401 412M415 309C425 330 432 360 429 412" class="vl-fine"/>
<circle pathLength="1" cx="362" cy="348" r="3"/><circle pathLength="1" cx="468" cy="347" r="3"/>
<path pathLength="1" d="M378 413H452"/>
<path pathLength="1" d="M415 222V206M415 208L429 211L415 215"/>
<path pathLength="1" d="M413.5 232L413 262C412.5 280 411 292 407 305M416.5 232L417 262C417.5 280 419 292 423 305"/>
<path pathLength="1" d="M398 309H432"/>
<path pathLength="1" d="M150 712H352M150 718H352"/>
<path pathLength="1" d="M160 700V745M172 700V745M184 700V745M196 700V745M220 700V745M232 700V745M244 700V745M256 700V745M268 700V745M280 700V745M292 700V745M304 700V745M316 700V745M328 700V745M340 700V745" class="vl-fine"/>`;
let houseST, houseDrawST;
/* rajzlap-keret a kép körül, behúzott sarkokkal (mint a kartus), két ág fentről */
function houseFrameGeom() {
  const pic = $('#housePic'), sv = $('#houseFrame'); if (!sv) return;
  const w = pic.offsetWidth, h = pic.offsetHeight, mob = isMob(), d = mob ? 10 : 18, r = mob ? 10 : 14, e = .5;
  const W = w + d * 2, Hh = h + d * 2, c = W / 2;
  sv.setAttribute('width', W); sv.setAttribute('height', Hh); sv.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  const [a, b] = $$('path', sv);
  a.setAttribute('d', `M${c} ${e}H${W - e - r}A${r} ${r} 0 0 0 ${W - e} ${e + r}V${Hh - e - r}A${r} ${r} 0 0 0 ${W - e - r} ${Hh - e}H${c}`);
  b.setAttribute('d', `M${c} ${e}H${e + r}A${r} ${r} 0 0 1 ${e} ${e + r}V${Hh - e - r}A${r} ${r} 0 0 1 ${e + r} ${Hh - e}H${c}`);
}
function setupHouse() {
  const g = $('#villaLines'); g.innerHTML = VILLA;
  const pic = $('#housePic');
  const setSW = () => pic.style.setProperty('--vsw', (1.25 * 890 / Math.max(200, pic.offsetWidth)).toFixed(3));
  setSW(); addEventListener('resize', setSW);
  houseFrameGeom();
  const lines = $$('path,circle', g);
  const states = $$('.house__state'), steps = $$('.house__step');
  const fp = $$('#houseFrame path');
  const signR = $('#signClip rect');
  let cur = 0;
  const show = i => {
    if (i === cur) return; cur = i;
    states.forEach((s, k) => s.classList.toggle('is-on', k === i));
    steps.forEach((s, k) => s.classList.toggle('is-on', k <= i));
    const sp = $('.split', states[i]);
    if (sp && !sp.classList.contains('is-in')) revealSplit(sp);
  };
  if (RM) { gsap.set([...lines, ...fp], { strokeDashoffset: 0 }); gsap.set('#houseFill', { scaleX: 1 }); signR.setAttribute('width', 330); steps.forEach(s => s.classList.add('is-on')); return; }

  // a keret már a beérkezés közben körbeér
  ScrollTrigger.create(Object.assign({ trigger: '.house', start: 'top 88%', end: 'top 5%', scrub: SCRUB, animation: gsap.fromTo(fp, { strokeDashoffset: OFF }, { strokeDashoffset: 0, ease: FLOW }) }, live($('#houseFrame'))));

  // A villa a talajtól felfelé nő, mint egy emelkedő szint: minden vonal akkor indul, amikor
  // a szint eléri az alját, alulról felfelé (vízszintesnél balról jobbra) rajzolódik, és
  // a hosszával arányos ideig, így a tinta mindenhol egyforma tempóban folyik.
  const Yb = 750, Yt = 200, R = Yb - Yt, v = R * 1.45;
  const draw = gsap.timeline();
  lines.forEach(p => {
    const L = p.getTotalLength();
    const a = p.getPointAtLength(0), b = p.getPointAtLength(L);
    let bot = -1e9;
    for (let i = 0; i <= 12; i++) bot = Math.max(bot, p.getPointAtLength(L * i / 12).y);
    const rev = Math.abs(a.y - b.y) > 8 ? a.y < b.y : a.x > b.x;
    draw.fromTo(p, { strokeDashoffset: rev ? -OFF : OFF }, { strokeDashoffset: 0, duration: Math.max(.06, L / v), ease: FLOW }, Math.max(0, (Yb - bot) / R) * .8);
  });
  // már a szakasz beúszásakor elindul, megálláskor kb. félig kész, utána a görgetéssel nő tovább
  const pinLen = () => $('.house').offsetHeight - innerHeight;
  houseDrawST = ScrollTrigger.create({ trigger: '.house', start: 'top 80%', end: () => '+=' + (innerHeight * .8 + pinLen() * .4), scrub: SCRUB, animation: draw, invalidateOnRefresh: true });

  // A ház: a rajz nő. Akkor: rajzlap-tónus, és a régi cégtábla felirata kiíródik a homlokzatra. Ma: a mai fotó.
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo('#houseFill', { scaleX: 0 }, { scaleX: .5, duration: .5 }, 0)
    .to('#houseFill', { scaleX: 1, duration: .18 }, .5)
    .to('#houseSheet', { opacity: 1, duration: .1 }, .44)
    .fromTo(signR, { attr: { width: 0 } }, { attr: { width: 330 }, duration: .1, ease: 'power1.inOut' }, .47)
    .to('.house__credit', { opacity: 1, duration: .06 }, .5)
    .fromTo('#houseNew', { opacity: 0 }, { opacity: 1, duration: .16 }, .63)
    .to('#houseDraw', { opacity: 0, duration: .12 }, .67)
    .to('.house__credit', { opacity: 0, duration: .06 }, .72)
    .to({}, { duration: .16 }, .84);
  houseST = ScrollTrigger.create({
    trigger: '.house', start: 'top top', end: 'bottom bottom', scrub: SCRUB, animation: tl,
    onUpdate: self => { const p = self.progress; show(p < .5 ? 0 : p < .68 ? 1 : 2); }
  });
}

/* ---------- Címek felúszása ---------- */
function revealSplit(el) {
  el.classList.add('is-in');
  gsap.to($$('.w>span', el), { yPercent: 0, duration: 1.2, stagger: .06, ease: EASE });
}
function setupSplits() {
  $$('.split').forEach(el => {
    if (el.id === 'heroH') return;
    if (el.closest('.house__state')) { if (el.closest('.house__state').dataset.state === '0') ScrollTrigger.create({ trigger: '.house', start: 'top 60%', once: true, onEnter: () => revealSplit(el) }); return; }
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => revealSplit(el) });
  });
}

/* ---------- A műhely vízszintes sora ---------- */
let shopTween = null;
function setupShop() {
  const sec = $('.shop'), track = $('#shopTrack');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const size = () => { sec.style.height = (innerHeight + dist()) + 'px'; };
    size();
    shopTween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true, onRefreshInit: size } });
    return () => { sec.style.height = ''; shopTween = null; };
  });
  return shopTween;
}

/* ---------- Kínálat: kép az egér mellett ----------
   Csak akkor látszik, ha az egér ténylegesen egy tétel fölött mozog. Görgetésre, a listáról
   lelépve, ablakváltáskor és ha a kínálat kikerül a képből, mindig eltűnik. */
function setupPeek() {
  const peek = $('#peek'); if (!peek || !FINE) return;
  const W = 260, Ht = 325, a = archHalves(.5, .5, W - 1, Ht - 1);
  peek.style.clipPath = `path('${a.full}')`;
  const imgs = $$('img', peek);
  const cols = $('.menu__cols');
  let on = 0, cur = '', loaded = false, shown = false, lx = -1, ly = -1;
  const qx = gsap.quickTo(peek, 'x', { duration: .55, ease: 'power3.out' });
  const qy = gsap.quickTo(peek, 'y', { duration: .55, ease: 'power3.out' });
  const items = $$('.menu li[data-peek]');
  const preload = () => { if (loaded) return; loaded = true; items.forEach(li => { const i = new Image(); i.src = li.dataset.peek; }); };
  const set = src => {
    if (src === cur) return; cur = src;
    on = 1 - on; imgs[on].src = src;
    imgs.forEach((x, k) => x.classList.toggle('is-on', k === on));
  };
  const pos = e => [Math.min(innerWidth - W - 16, e.clientX + 28), Math.max(16, Math.min(innerHeight - Ht - 16, e.clientY - Ht / 2))];
  const show = e => {
    const [x, y] = pos(e);
    if (!shown) { shown = true; qx(x, x); qy(y, y); gsap.fromTo(peek, { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power3.out', overwrite: 'auto' }); }
    else { qx(x); qy(y); }
  };
  const hide = () => { if (!shown) return; shown = false; gsap.to(peek, { autoAlpha: 0, scale: .96, duration: .3, ease: 'power2.out', overwrite: 'auto' }); };
  cols.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    // a görgetés után a böngésző „álmozgást” küldhet: csak valódi elmozdulásra reagál
    if (e.clientX === lx && e.clientY === ly) return;
    lx = e.clientX; ly = e.clientY;
    const li = e.target.closest && e.target.closest('li[data-peek]');
    if (!li) { hide(); return; }
    preload(); set(li.dataset.peek); show(e);
  });
  cols.addEventListener('pointerleave', hide);
  addEventListener('scroll', hide, { passive: true });
  addEventListener('blur', hide);
  document.addEventListener('pointerleave', hide);
  new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) { hide(); gsap.set(peek, { autoAlpha: 0 }); } })).observe(cols);
}

/* ---------- Vélemények ---------- */
function setupQuotes() {
  const qs = $$('#quotes .q'), bs = $$('#quotesNav button');
  let i = 0, t;
  const go = n => { i = (n + qs.length) % qs.length; qs.forEach((q, k) => q.classList.toggle('is-on', k === i)); bs.forEach((b, k) => b.setAttribute('aria-selected', k === i ? 'true' : 'false')); };
  const run = () => { clearInterval(t); if (!RM) t = setInterval(() => go(i + 1), 7000); };
  bs.forEach((b, k) => b.addEventListener('click', () => { go(k); run(); }));
  const st = $('#quotes');
  st.addEventListener('pointerenter', () => clearInterval(t));
  st.addEventListener('pointerleave', run);
  run();
}

/* ---------- Fejléc, menü ---------- */
function setupHeader() {
  const hd = $('#hd'); let last = scrollY, solidAt = 0;
  // a belépőben a fejléc átlátszó marad, amíg a keret vonala látszik (különben két vízszintes vonal futna egymás alatt)
  const measure = () => { solidAt = Math.max(40, ($('.hero').offsetHeight - innerHeight) * .16); };
  measure(); addEventListener('resize', measure);
  const on = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', y > solidAt);
    if (!document.body.classList.contains('menu-open')) hd.classList.toggle('is-hidden', y > last && y > 400);
    last = y;
  };
  addEventListener('scroll', on, { passive: true }); on();
  const bg = $('#burger'), dr = $('#drawer');
  const toggle = open => {
    bg.setAttribute('aria-expanded', open); dr.classList.toggle('is-open', open); dr.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open); document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open && !RM) gsap.fromTo($$('#drawer nav a'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, stagger: .06, delay: .1 });
  };
  bg.addEventListener('click', () => toggle(bg.getAttribute('aria-expanded') !== 'true'));
  $$('#drawer a').forEach(a => a.addEventListener('click', () => toggle(false)));
  $$('.lang button').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== lang) { applyLang(b.dataset.lang); requestAnimationFrame(() => { heroLayout(); ScrollTrigger.refresh(); }); } }));
}

/* ---------- Horgonyok: natív, sima ugrás (a görgetést nem vesszük át, így az mindenhol a rendszeré marad) ---------- */
function setupAnchors() {
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || a.classList.contains('skip')) return;
    const t = id === '#top' ? null : $(id);
    if (id !== '#top' && !t) return;
    e.preventDefault();
    const top = t ? t.getBoundingClientRect().top + scrollY : 0;
    scrollTo({ top, behavior: RM ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  }));
}

/* ---------- Indítás ---------- */
function reveals() {
  if (RM) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, stagger: .09, ease: EASE }) });
}

function ready() {
  const img = $('#heroImg');
  const dec = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  return Promise.race([Promise.all([dec, fonts]), new Promise(r => setTimeout(r, 2600))]);
}

function init() {
  $('#heroH').classList.add('split');
  if (lang !== 'hu') applyLang(lang); else { $$('.split').forEach(splitWords); hours(); }
  heroLayout();
  setupAnchors();
  setupHeader();
  buildStrikes();
  setupHouse();
  const ct = setupShop();
  setupFrames(ct);
  setupCarts(ct);
  setupOrns();
  setupSplits();
  setupPeek();
  setupQuotes();
  reveals();
  if (RM) {
    gsap.set('.hl', { strokeDashoffset: 0 }); gsap.set('#heroCur', { autoAlpha: 0 }); gsap.set($$('#heroH .w>span'), { yPercent: 0 });
  } else {
    heroPrep();
    heroScroll();
    ready().then(heroIntro);
  }
  document.documentElement.classList.add('ok');
  if (/[?&]debug/.test(location.search)) window.__nana = { H, Z };
  let rw = innerWidth, rh = innerHeight;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - rw) < 2 && Math.abs(innerHeight - rh) < 120) return;
    rw = innerWidth; rh = innerHeight;
    heroLayout(); buildStrikes(); houseFrameGeom();
    $$('.frame').forEach(frameGeom); $$('[data-cart]').forEach(cartGeom);
    ScrollTrigger.refresh();
  });
  setInterval(hours, 60000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
