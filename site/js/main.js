/* Café Nana v4: sötét kupolakék nyitókép, élő nyitvatartás a fejlécben, kupolaívvel egymásra csúszó szakaszok,
   három ívablakból egy képpé nyíló ház, szárnyas ajtóként nyíló szalon, ívablakos műhely.
   v3: v2.4 + puha görgetés egérrel (Lenis), kupola-kurzor, mélységtérképes nyitókép, soronként felúszó címek,
   ív alakú gombkitöltés, a ház fotója a torony ívéből nyílik, papírként felemelkedő étlap, Google-vélemények, függöny-lábléc.
   Érintőképernyőn semmi nem követi az ujjat: ott minden egyszer, a saját tempójában fut le. */
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
const HTML = document.documentElement;
if (!FINE) HTML.classList.add('touch');
// valódi videókártya? (szoftveres megjelenítésnél a térhatás és a papírszemcse kimarad)
const HW = (() => {
  try {
    const c = document.createElement('canvas'), g = c.getContext('webgl');
    if (!g) return false;
    const ext = g.getExtension('WEBGL_debug_renderer_info');
    const r = ext ? String(g.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    const lose = g.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r);
  } catch (e) { return false; }
})();
/* Görgetéshez kötött rajzolás: egérrel a görgetés viszi, érintőn egyszer lefut, amikor a látótérbe ér (dur mp alatt). */
function drive(tl, cfg, liveEls, dur) {
  if (FINE) return ScrollTrigger.create(Object.assign({ animation: tl, scrub: SCRUB }, cfg, liveEls ? live(liveEls) : {}));
  tl.pause(0);
  const els = liveEls ? [].concat(liveEls) : [];
  return ScrollTrigger.create({ trigger: cfg.trigger, start: cfg.touch || 'top 84%', once: true, onEnter: () => {
    els.forEach(e => e.classList.add('is-live'));
    tl.eventCallback('onComplete', () => setTimeout(() => els.forEach(e => e.classList.remove('is-live')), 300));
    tl.timeScale(tl.duration() / (dur || 1.8)).play();
  } });
}

/* ---------- Nyelv ---------- */
const DE = {
  'skip':'Zum Inhalt springen','nav.haz':'Das Haus','nav.muhely':'Kuchen','nav.kinalat':'Speisekarte','nav.latogatas':'Kontakt','menu.open':'Menü',
  'hero.h':'Glutenfreie Konditorei in&nbsp;Sopron',
  'hero.p':'Sie finden uns in der József Attila utca, im Eckhaus mit dem Türmchen. Frühstück gibt es auch, und jeden Kuchen können Sie mitnehmen.',
  'hero.b1':'Speisekarte','hero.b2':'Anfahrt',
  'free.aria':'Ohne Gluten, Zucker, Milch und Ei','free.w1':'Gluten,','free.w2':'Zucker,','free.w3':'Milch,','free.w4':'Ei.',
  'free.p1':'Nichts davon kommt in unsere Kuchen. Die Küche ist komplett glutenfrei, auch der Toast und die Bagels zum Frühstück.',
  'free.p2':'Zum Kaffee gibt es Kokos-, Mandel- oder Haferdrink. Wenn Sie auf etwas sehr empfindlich reagieren, fragen Sie an der Theke, wir sagen Ihnen, was in welchem Kuchen steckt.',
  'house.h':'Das Haus','house.p':'Es gehört seit langem unserer Familie und steht unter örtlichem Denkmalschutz. Auf einem alten Foto war hier noch ein Gasthaus, Sass Lajos Rákóczi vendéglője.',
  'house.p2':'Heute Café und Konditorei. Beim Einrichten waren die alten Kaffeehäuser der Löwern unser Vorbild.',
  'salon.h':'Der Salon','salon.p':'Drinnen Kamin, Kronleuchter, Fischgrätparkett und weiße Stühle im Louis-seize-Stil. Bei schönem Wetter kann man auch draußen auf der Terrasse sitzen.','salon.a':'Drinnen','salon.b':'Draußen',
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
  'rev.h':'Das schreiben unsere Gäste','rev.rate':'4,6 Sterne bei Google, aus mehr als 250 Bewertungen','rev.stars':'5 Sterne',
  'rv1':'„Ein Traum! Wir sind 300 km für diese Stimmung gefahren. Zu Weihnachten ein ‚must visit place‘! Himmlische Kuchen und Gebäck. Alles ohne. Die Bedienungen sind sehr lieb.“','rv1s':'Google-Bewertung, Oktober 2026, aus dem Ungarischen',
  'rv2':'„Ich habe hier einen sehr feinen Kuchen ohne alles gegessen, und auch der Kaffee war von tadelloser Qualität! Wenn wir wieder in der Gegend sind, kommen wir bestimmt wieder.“','rv2s':'Google-Bewertung, Oktober 2026, aus dem Ungarischen',
  'rv3':'„Feine gluten- und laktosefreie Kuchen mit hervorragendem Kaffee. Die Einrichtung zeigt einen gutbürgerlichen Geschmack wie in alten Zeiten, dazu freundliche Bedienung, danke!“','rv3s':'Google-Bewertung, 2024, aus dem Ungarischen',
  'rev.ask':'Waren Sie schon bei uns? Schreiben Sie, wie es Ihnen gefallen hat.','rev.b':'Bewertung auf Google schreiben',
  'visit.h':'Kontakt','visit.p':'An der Ecke József Attila utca und Újlaki utca. Kartenzahlung ist möglich.',
  'visit.b1':'Route planen','visit.b2':'Facebook',
  'hours.h':'Öffnungszeiten','d0':'Sonntag','d1':'Montag','d2':'Dienstag','d3':'Mittwoch','d4':'Donnerstag','d5':'Freitag','d6':'Samstag','closed':'geschlossen',
  'ft.c':'© 2026 Café Nana','ft.photo':'Titelbild: Kisklau'
};
const HU = {};
$$('[data-i18n]').forEach(el => { HU[el.dataset.i18n] = el.innerHTML; });
$$('[data-i18n-html]').forEach(el => { HU[el.dataset.i18nHtml] = el.innerHTML; });
$$('[data-i18n-aria]').forEach(el => { HU[el.dataset.i18nAria] = el.getAttribute('aria-label'); });
let lang = 'hu', leadReady = false;
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
  wrapBtns();
  buildShopList();
  if (typeof setupLead === 'function' && leadReady) setupLead();
  try { localStorage.setItem('nana-lang', l); } catch (e) {}
}

/* ---------- Szavakra bontás (a címek felúszásához) ---------- */
function splitWords(el) {
  const text = el.textContent.replace(/[ \t\n\r]+/g, ' ').trim();
  el.setAttribute('aria-label', text.replace(/\u00a0/g, ' '));
  el.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
  if (!el.classList.contains('is-in') && !RM) gsap.set($$('.w>span', el), { yPercent: 112, rotate: 3 });
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
  const hd = $('#hdNow');
  if (hd) {
    const up = x => x.charAt(0).toUpperCase() + x.slice(1);
    let txt, open = false;
    if (t && h >= t[0] && h < t[1]) { open = true; txt = lang === 'de' ? `Jetzt geöffnet, bis ${fmt(t[1])} Uhr` : `Most nyitva, ${fmt(t[1])}-ig`; }
    else if (t && h < t[0]) txt = lang === 'de' ? `Heute ab ${fmt(t[0])} Uhr geöffnet` : `Ma ${fmt(t[0])}-kor nyitunk`;
    else {
      let n = 1; while (!HOURS[(day + n) % 7]) n++;
      const nd = (day + n) % 7, o = fmt(HOURS[nd][0]);
      txt = lang === 'de' ? `${n === 1 ? 'Morgen' : up(NEXT_DE[nd])} ab ${o} Uhr geöffnet` : `${n === 1 ? 'Holnap' : up(NEXT_HU[nd])} ${o}-kor nyitunk`;
    }
    hd.classList.toggle('is-open', open); $('span', hd).textContent = txt;
  }
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
    root.setProperty('--rh', $('#heroR').offsetHeight + 'px');
    root.setProperty('--hh', $('#heroH').offsetHeight + 'px');
  }
  H.lastO = -1;
  heroRender();
}

const NAVS = '.hd__nav, .hd__now, .hd__tools, #burger';
const G = { ok: false, m: [0, 0], mT: [0, 0], run: false, vis: true, x: 0, y: 0, sc: 1, draw: null, init: null };
/* Z.s: az ablak nagyítása, Z.p: a fotó útja a végső helyéig (0..1), Z.k: a nyitány lassú „leülése” */
const Z = { s: 1, p: 0, k: 1, z: 1, d: 0 };
/* O.d: a nyitány után az ív két fele szárnyas ajtóként széthúzódik és felemelkedik, a fotó kitölti a képernyőt */
const O = { d: 0 };
function heroRender() {
  const P = H.photo; if (!P) return;
  const A = H.A, p = Z.p, k = Z.k;
  let x = P.s0.x + (P.s1.x - P.s0.x) * p, y = P.s0.y + (P.s1.y - P.s0.y) * p;
  const kk = k * Z.z;
  const sc = (P.s0.scale + (1 - P.s0.scale) * p) * kk;
  if (kk !== 1) { x = A.cx - (A.cx - x) * kk; y = A.cy - (A.cy - y) * kk; }
  $('#heroImg').style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${sc.toFixed(5)})`;
  G.x = x; G.y = y; G.sc = sc;
  if (G.ok && G.vis) G.draw();
  if (O.d > 0) { heroOpenRender(); return; }
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
/* Az ív bal és jobb fele szétválik (köztük egyenes szemöldökkel), felemelkedik és kifut a képből, a talpa leér a képernyő aljáig.
   A vonalak a két féllel mennek, és közben elhalványulnak; a kép közben a végső, teljes képernyős helyére úszik. */
function heroOpenRender() {
  const d = O.d, A = H.A, Wa = A.w, Ha = A.h, s = archHalves(A.x, A.y, Wa, Ha).s;
  if (d >= 1) {
    if (H.lastO !== 1) { $('#heroWin').style.clipPath = 'none'; gsap.set('#heroLines', { autoAlpha: 0 }); H.lastO = 1; }
    return;
  }
  H.lastO = d;
  const e = gsap.parseEase('power3.inOut')(d);
  const dx = e * (A.cx + 40), dy = e * (A.y + Ha * .55);
  let by = A.y + Ha + e * e * (H.vh - A.y - Ha + 4);
  // a kép alsó 12%-a (a fotós jelzése) sosem kerül a nyílásba
  by = Math.min(by, G.y + H.photo.Hp * G.sc * .88);
  const x0 = A.x - dx, x1 = A.x + dx, y0 = A.y - dy;
  const p = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const path = `M${p(x0, by)}L${p(x0, y0 + s)}C${p(x0, y0 + s * .42)} ${p(x0 + Wa * .30, y0 + s * .36)} ${p(x0 + Wa * .41, y0 + s * .17)}C${p(x0 + Wa * .465, y0 + s * .07)} ${p(x0 + Wa * .49, y0 + s * .025)} ${p(x0 + Wa * .5, y0)}L${p(x1 + Wa * .5, y0)}C${p(x1 + Wa * .51, y0 + s * .025)} ${p(x1 + Wa * .535, y0 + s * .07)} ${p(x1 + Wa * .59, y0 + s * .17)}C${p(x1 + Wa * .70, y0 + s * .36)} ${p(x1 + Wa, y0 + s * .42)} ${p(x1 + Wa, y0 + s)}L${p(x1 + Wa, by)}Z`;
  $('#heroWin').style.clipPath = `path('${path}')`;
  const fade = Math.max(0, 1 - d * 1.7).toFixed(3);
  ['#hlL', '#hlL2'].forEach(id => { const el = $(id); el.setAttribute('transform', `translate(${-dx.toFixed(1)} ${-dy.toFixed(1)})`); el.style.opacity = fade; });
  ['#hlR', '#hlR2'].forEach(id => { const el = $(id); el.setAttribute('transform', `translate(${dx.toFixed(1)} ${-dy.toFixed(1)})`); el.style.opacity = fade; });
  const f = $('#hlFin'); f.setAttribute('transform', `translate(0 ${-dy.toFixed(1)})`); f.style.opacity = Math.max(0, 1 - d * 3).toFixed(3);
  const g = Math.max(0, 1 - d * 2.6).toFixed(3);
  ['#hlGl', '#hlGr', '#hlCurls'].forEach(id => { $(id).style.opacity = g; });
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
  const L1 = $('#hlL2').getTotalLength(), L2 = $('#hlGl').getTotalLength();
  const T1 = 1.05, T2 = gsap.utils.clamp(1.1, 1.7, T1 * L2 / Math.max(1, L1));
  const t1 = .55, t2 = t1 + T1;
  const tl = gsap.timeline({ delay: .05 });
  tl.to('.hd__logo', { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 0)
    .to('#hlFin', { strokeDashoffset: 0, duration: .45, ease: 'power1.in' }, .18)
    .to(['#hlL2', '#hlR2'], { strokeDashoffset: 0, duration: T1, ease: 'power1.in' }, t1)
    .to(['#hlL', '#hlR'], { strokeDashoffset: 0, duration: T1 * 1.1, ease: 'power1.in' }, t1 + .14)
    .to('#heroCur', { y: () => H.curY, duration: T1 * 1.3, ease: 'power1.in', onComplete: () => gsap.set('#heroCur', { autoAlpha: 0 }) }, t1 + .04)
    .to(Z, { k: 1, duration: 2.8, ease: 'expo.out', onUpdate: heroRender }, t1 + .25)
    .to(['#hlGl', '#hlGr'], { strokeDashoffset: 0, duration: T2, ease: 'power1.out' }, t2)
    .to(['#hlCl', '#hlCr'], { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out' }, t2 + .04)
    .to(NAVS, { opacity: 1, duration: 1, ease: 'power2.out', stagger: .06 }, t2 + T2 * .5);
  // az ív kinyílik, és a fotó lesz a kezdőkép; a feliratok csak utána jönnek
  // a nyílás hamar indul (a tempója nem változott)
  const tO = t2 + .45, DO = 2.2;
  tl.to(Z, { p: 1, duration: DO * .8, ease: 'power2.inOut', onUpdate: heroRender }, tO)
    .to(O, { d: 1, duration: DO, ease: 'none', onUpdate: heroRender }, tO)
    .add(() => HTML.classList.add('hero-open'), tO + DO * .45)
    .add(() => revealSplit($('#heroH')), tO + DO * .72)
    .to('#heroR > *', { opacity: 1, y: 0, duration: 1.1, stagger: .09 }, tO + DO * .8)
    .add(() => { $('#heroH').classList.add('is-in'); gsap.set(['.hd__logo', NAVS, '#heroR > *'], { clearProps: 'opacity,transform' }); }, tO + DO + 1)
    .add(() => { if (G.init) G.init(); }, '+=.4');
  return tl;
}

let heroST;
/* Görgetésre az ív a helyén marad: a fotó benne lassan közelebb jön (egérrel a mélységtérkép szerint, az előtér jobban),
   a belépő lassabban halad, mint a lap, és a következő szakasz papírja rácsúszik. Érintőn semmi nem követi az ujjat. */
function heroScroll() {
  if (heroST) { heroST.kill(); heroST.animation && heroST.animation.kill(); }
  if (!FINE) return;
  const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: heroRender });
  tl.to(Z, { z: 1.09, d: 1, duration: 1 }, 0)
    .to('#heroStage', { yPercent: 34, duration: 1 }, 0)
    .to(['#heroL', '#heroR'], { y: -50, opacity: 0, duration: .55 }, .05);
  heroST = ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: SCRUB, animation: tl, invalidateOnRefresh: true });
}

/* ---------- Belépő térben: mélységtérkép szerint mozdul az egérre, görgetésre az előtér közelebb jön ----------
   Csak egérrel és valódi videókártyával; a vászon pontosan a fotó helyére rajzol, így a csere nem látszik. */
function setupGL() {
  if (!FINE || RM || !HW || /[?&]nogl/.test(location.search)) return;
  const win = $('#heroWin');
  const cv = document.createElement('canvas'); cv.className = 'hero__gl'; cv.setAttribute('aria-hidden', 'true');
  win.insertBefore(cv, $('#heroCur'));
  const opt = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' };
  let gl = cv.getContext('webgl2', opt); const gl2 = !!gl;
  if (!gl) gl = cv.getContext('webgl', opt);
  if (!gl) { cv.remove(); return; }
  const VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
  const FS = ['precision highp float;varying vec2 v;',
    'uniform sampler2D uI,uD;uniform vec2 uRes,uOff,uSize,uM;uniform float uZ;',
    'const vec2 C=vec2(.5,.4);',
    'void main(){vec2 t=(v*uRes-uOff)/uSize;vec2 p=t;',
    ' for(int i=0;i<3;i++){float d=texture2D(uD,p).r;p=t+uM*(d-.45)*vec2(.014,.008)-(t-C)*(d-.35)*uZ;}',
    ' gl_FragColor=vec4(texture2D(uI,clamp(p,0.,1.)).rgb,1.);}'].join('\n');
  const sh = (tp, src) => { const x = gl.createShader(tp); gl.shaderSource(x, src); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { cv.remove(); return; }
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uI', 'uD', 'uRes', 'uOff', 'uSize', 'uM', 'uZ'].forEach(n => { U[n] = gl.getUniformLocation(pr, n); });
  const tex = (unit, src, mip) => {
    const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
    // WebGL2-ben a nem kettőhatvány képnek is lehet mipmapje: kicsinyítve sem vibrál
    if (mip && gl2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  };
  let cw = 0, ch = 0;
  const size = () => {
    cw = stage.clientWidth; ch = stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cw, ch);
  };
  G.draw = () => {
    const P = H.photo; if (!P) return;
    gl.uniform2f(U.uOff, G.x, G.y); gl.uniform2f(U.uSize, P.Wp * G.sc, P.Hp * G.sc);
    gl.uniform2f(U.uM, G.m[0], G.m[1]); gl.uniform1f(U.uZ, Z.d * .06);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const frame = () => {
    let moving = false;
    for (let i = 0; i < 2; i++) { const d = G.mT[i] - G.m[i]; if (Math.abs(d) > .0008) { G.m[i] += d * .06; moving = true; } else G.m[i] = G.mT[i]; }
    G.draw();
    if (!moving || !G.vis) { G.run = false; gsap.ticker.remove(frame); }
  };
  const kick = () => { if (G.ok && G.vis && !G.run) { G.run = true; gsap.ticker.add(frame); } };
  G.init = () => {
    G.init = null;
    const im = new Image(), dep = new Image();
    im.src = 'img/hero-2800.webp?v=9'; dep.src = 'img/hero-depth.webp?v=9';
    const idle = window.requestIdleCallback || (f => setTimeout(f, 1));
    const bm = x => window.createImageBitmap ? createImageBitmap(x).catch(() => x) : Promise.resolve(x);
    idle(() => {
      Promise.all([im.decode(), dep.decode()]).then(() => Promise.all([bm(im), bm(dep)])).then(b => {
        tex(0, b[0], true); tex(1, b[1], false);
        gl.uniform1i(U.uI, 0); gl.uniform1i(U.uD, 1);
        G.ok = true; size(); G.draw();
        HTML.classList.add('hero-3d');
      }).catch(() => {});
    }, { timeout: 1500 });
  };
  stage.addEventListener('pointermove', e => { G.mT[0] = (e.clientX / innerWidth - .5) * 2; G.mT[1] = (e.clientY / innerHeight - .5) * 2; kick(); });
  stage.addEventListener('pointerleave', () => { G.mT[0] = G.mT[1] = 0; kick(); });
  new IntersectionObserver(es => { G.vis = es[0].isIntersecting; if (G.vis && G.ok) G.draw(); }).observe(stage);
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); G.ok = false; HTML.classList.remove('hero-3d'); });
  G.resize = () => { if (G.ok) { size(); G.draw(); } };
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
  strikeST = drive(tl, { trigger: h, start: 'top 80%', end: 'bottom 64%', touch: 'top 72%' }, $$('.strike svg', h), 3.2);
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
    const inShop = false;
    const early = inShop && f.getBoundingClientRect().left < innerWidth * .9;
    // a keret vonala a görgetéssel együtt nő körbe a kép körül
    const draw = gsap.fromTo(paths, { strokeDashoffset: OFF }, { strokeDashoffset: 0, ease: FLOW });
    drive(draw, Object.assign({ trigger: early ? '.shop' : f },
      early ? { start: 'top 82%', end: 'top top' } : inShop ? { containerAnimation: container, start: 'left 100%', end: shopEnd(f, 38) } : { start: 'top 96%', end: 'center 42%' }), svg, 1.7);
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
    const inShop = false;
    const big = el.classList.contains('menu__card');
    drive(tl, Object.assign({ trigger: el },
      inShop ? { containerAnimation: container, start: 'left 100%', end: shopEnd(el, 42) } : big ? { start: 'top 92%', end: 'top 12%' } : { start: 'top 94%', end: 'center 48%' }), s, big ? 2.4 : 2);
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
    drive(tl, { trigger: o, start: 'top 97%', end: 'top 58%' }, o, 1.8);
  });
}

/* ---------- A ház: a mai fotó három ívablakban kezdődik (a középsőben a kupola), görgetésre egy képpé nyílnak ----------
   Az ívek a talajtól emelkednek fel, a vékony körvonal követi őket; aztán szélesednek, és a csúcsuk kifut a képből. */
let houseResize = null;
function setupHouse() {
  const pic = $('#housePic'), win = $('#houseWin'), img = $('#houseImg'), svg = $('#houseLines'), ln = $$('path', svg);
  if (RM) return;
  // ív középpontja, szélessége, csúcsa (a kép arányában); a középső a kupolára esik, és magasabb
  const C0 = [.29, .59, .885], W0 = [.18, .2, .17], T0 = [.34, .03, .4];
  const S = { q: 0, p: 0 };
  const lerp = (a, b, t) => a + (b - a) * t;
  const eP = gsap.parseEase('power2.inOut');
  let W = 1, Hh = 1;
  const measure = () => { W = pic.offsetWidth; Hh = pic.offsetHeight; svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); };
  const render = () => {
    const q = S.q, p = eP(S.p);
    if (p >= .999) { win.style.clipPath = 'none'; svg.style.opacity = 0; img.style.transform = 'none'; return; }
    const A = [0, 1, 2].map(i => {
      const cx = lerp(C0[i], (i * 2 + 1) / 6, p) * W, w = lerp(W0[i] * W, W / 3 + 4, p);
      const t0 = lerp(Hh, T0[i] * Hh, q), top = lerp(t0, -Hh * .8, p);
      return archHalves(cx - w / 2, top, w, Hh + 2 - top);
    });
    win.style.clipPath = `path('${A.map(a => a.full).join(' ')}')`;
    A.forEach((a, i) => ln[i].setAttribute('d', a.full.replace(/Z$/, '')));
    svg.style.opacity = Math.max(0, 1 - p * 2.2).toFixed(3);
    img.style.transform = `scale(${(1.14 - .14 * p).toFixed(4)})`;
  };
  gsap.set(ln, { strokeDashoffset: 0 });
  measure(); render();
  houseResize = () => { measure(); render(); };
  if (FINE) {
    // beérkezés közben emelkednek fel az ívek, a kitűzött szakaszban nyílnak egy képpé
    ScrollTrigger.create({ trigger: '.house', start: 'top 78%', end: 'top 8%', scrub: SCRUB, animation: gsap.to(S, { q: 1, ease: 'power1.out', onUpdate: render }), ...live(win) });
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(S, { p: 1, duration: .72, onUpdate: render }, .14).to({}, { duration: .14 }, .86);
    ScrollTrigger.create({ trigger: '.house', start: 'top top', end: 'bottom bottom', scrub: .7, animation: tl, invalidateOnRefresh: true, ...live(win) });
  } else {
    ScrollTrigger.create({ trigger: pic, start: 'top 72%', once: true, onEnter: () => {
      win.classList.add('is-live');
      gsap.timeline({ onComplete: () => win.classList.remove('is-live') })
        .to(S, { q: 1, duration: 1.5, ease: 'power2.out', onUpdate: render })
        .to(S, { p: 1, duration: 2.1, ease: 'none', onUpdate: render }, '+=.35');
    } });
  }
}

/* ---------- Címek felúszása ---------- */
function lineDelays(el) {
  let top = null, li = -1, j = 0;
  return $$('.w', el).map(w => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 4) { top = t; li++; j = 0; } return li * .13 + j++ * .03; });
}
function revealSplit(el, delay) {
  el.classList.add('is-in');
  const d = lineDelays(el);
  $$('.w>span', el).forEach((sp, i) => gsap.to(sp, { yPercent: 0, rotate: 0, duration: 1.35, ease: EASE, delay: (delay || 0) + d[i] }));
}
function setupSplits() {
  $$('.split').forEach(el => {
    if (el.id === 'heroH') return;
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => revealSplit(el) });
  });
}

/* ---------- A műhely: egérrel egy kitűzött ívablak, amiben a sütemények egymás után emelkednek fel, mint a vitrin polcai;
   mellette a lista mutatja, hol tartunk. Érintőn és keskeny képernyőn a képek sorban jönnek, ívtetővel. ---------- */
function buildShopList() {
  const list = $('#shopList'); if (!list) return;
  const on = $('li.on', list), k = on ? $$('li', list).indexOf(on) : 0;
  list.innerHTML = $$('#shopWin .sh').map((f, i) => `<li${i === k ? ' class="on"' : ''}><small>0${i + 1}</small><b>${$('b', f).innerHTML}</b><span><em>${$('figcaption span', f).innerHTML}</em></span></li>`).join('');
}
function setupShop() {
  const sec = $('.shop'), run = $('#shopRun'), win = $('#shopWin'), list = $('#shopList');
  const figs = $$('.sh', win), imgs = figs.map(f => $('img', f)), n = figs.length;
  buildShopList();
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (hover: hover) and (pointer: fine)', () => {
    sec.classList.add('shop--pin');
    // minden kép a saját arányában áll (semmi nem vágódik le), a keret a mindenkori képhez igazodik
    const frame = $('#shopFrame'), RT = imgs.map(im => (+im.getAttribute('width')) / (+im.getAttribute('height')));
    // négyzetes ablakban: az álló kép teljes magas, a fekvő teljes széles
    const fw = i => Math.min(win.offsetWidth, win.offsetHeight * RT[i]), fh = i => fw(i) / RT[i];
    const fx = i => (win.offsetWidth - fw(i)) / 2, fy = i => (win.offsetHeight - fh(i)) / 2;
    const geom = () => {
      figs.forEach((f, i) => { Object.assign(f.style, { width: fw(i) + 'px', height: fh(i) + 'px', left: fx(i) + 'px', top: fy(i) + 'px' }); });
      run.style.height = (innerHeight + (n - 1) * innerHeight * .78) + 'px';
    };
    geom();
    gsap.set(frame, { width: () => fw(0) + 24, height: () => fh(0) + 24, x: () => fx(0) - 12, y: () => fy(0) - 12 });
    const draw = gsap.fromTo(frame, { opacity: 0, scaleY: .92 }, { opacity: 1, scaleY: 1, ease: 'power2.out' });
    const dST = ScrollTrigger.create({ trigger: run, start: 'top 72%', end: 'top 12%', scrub: SCRUB, animation: draw });
    // a következő kép alulról emelkedik fel, a keret közben átméreteződik, az előző elhalványul mögötte
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    for (let i = 1; i < n; i++) {
      const at = i - 1 + .45, k = i;
      gsap.set(figs[i], { clipPath: 'inset(100% 0% 0% 0%)' });
      tl.to(frame, { width: () => fw(k) + 24, height: () => fh(k) + 24, x: () => fx(k) - 12, y: () => fy(k) - 12, duration: .8, ease: 'power2.inOut' }, at)
        .to(figs[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'power2.inOut' }, at)
        .fromTo(imgs[i], { scale: 1.1 }, { scale: 1, duration: .9, ease: 'power2.out' }, at)
        .to(figs[i - 1], { opacity: 0, duration: .45, ease: 'power1.in' }, at + .3);
    }
    tl.to({}, { duration: .25 }, n - 1 + .3);
    const items = () => $$('li', list);
    let cur = 0;
    const st = ScrollTrigger.create({ trigger: run, start: 'top top', end: 'bottom bottom', scrub: .6, animation: tl, invalidateOnRefresh: true, onRefreshInit: geom,
      onUpdate: s => {
        const t = s.progress * tl.duration(), k = Math.max(0, Math.min(n - 1, Math.floor(t + .15)));
        list.style.setProperty('--prog', s.progress.toFixed(4));
        if (k !== cur) { cur = k; items().forEach((li, i) => li.classList.toggle('on', i === k)); }
      }, ...live(figs) });
    return () => {
      sec.classList.remove('shop--pin'); run.style.height = ''; dST.kill(); st.kill(); tl.kill(); draw.kill();
      gsap.set([...figs, ...imgs, frame], { clearProps: 'all' });
    };
  });
  mm.add('not ((min-width: 900px) and (hover: hover) and (pointer: fine))', () => {
    if (RM) return;
    const sts = figs.map(f => {
      const im = $('.sh__img', f), cap = $('figcaption', f);
      gsap.set(im, { clipPath: 'inset(100% 0% 0% 0%)' }); gsap.set(cap, { opacity: 0, y: 14 });
      return ScrollTrigger.create({ trigger: f, start: 'top 86%', once: true, onEnter: () => {
        gsap.to(im, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
        gsap.fromTo($('img', im), { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'expo.out' });
        gsap.to(cap, { opacity: 1, y: 0, duration: 1.1, delay: .5, ease: EASE });
      } });
    });
    return () => sts.forEach(x => x.kill());
  });
}

/* ---------- Kínálat: kép az egér mellett ----------
   Csak akkor látszik, ha az egér ténylegesen egy tétel fölött mozog. Görgetésre, a listáról
   lelépve, ablakváltáskor és ha a kínálat kikerül a képből, mindig eltűnik. */
function setupPeek() {
  const peek = $('#peek'); if (!peek || !FINE) return;
  document.body.append(peek);
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

/* ---------- Mentesség: a bevezető mondat szavanként sötétedik (egérrel a görgetéssel, érintőn egyszer) ---------- */
let leadST;
function setupLead() {
  const p = $('.free .lead'); if (!p) return;
  const txt = p.textContent.replace(/[ \t\n\r]+/g, ' ').trim();
  p.innerHTML = txt.split(' ').map(w => `<span class="wl">${w}</span>`).join(' ');
  const ws = $$('.wl', p);
  if (leadST) { leadST.kill(); leadST = null; }
  if (RM) { ws.forEach(w => w.classList.add('on')); return; }
  const lit = n => ws.forEach((w, i) => w.classList.toggle('on', i < n));
  if (FINE) leadST = ScrollTrigger.create({ trigger: p, start: 'top 82%', end: 'bottom 50%', onUpdate: st => lit(Math.round(st.progress * ws.length)) });
  else leadST = ScrollTrigger.create({ trigger: p, start: 'top 80%', once: true, onEnter: () => ws.forEach((w, i) => setTimeout(() => w.classList.add('on'), 120 + i * 70)) });
}

/* ---------- Szalon: a kép a kereten belül lassabban mozdul (csak egérrel) ---------- */
function setupParallax() {
  if (!FINE || RM) return;
  // a szalon képe a keretben lassabban mozdul; a terasz képe egészben látszik, és a kerettel együtt kicsit gyorsabban emelkedik
  $$('.salon img.px').forEach(im => {
    gsap.set(im, { scale: 1.1 });
    gsap.fromTo(im, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: im.closest('.frame'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  if (!isMob()) gsap.fromTo('.salon__b', { y: 90 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.salon__pair', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------- Étlap: a kártya papírlapként emelkedik fel és simul ki ---------- */
function setupMenuRise() {
  const c = $('.menu__card'); if (!c || RM) return;
  if (FINE && HW) {
    gsap.fromTo(c, { rotateX: 11, y: 90, scale: .955, transformPerspective: 1500, transformOrigin: '50% 100%' },
      { rotateX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.menu', start: 'top bottom', end: 'top 12%', scrub: .6,
        onToggle: st => c.classList.toggle('is-live', st.isActive) } });
  } else {
    gsap.set(c, { y: 60, rotateX: 7, transformPerspective: 1500, transformOrigin: '50% 100%', opacity: .001 });
    ScrollTrigger.create({ trigger: '.menu', start: 'top 82%', once: true, onEnter: () => gsap.to(c, { y: 0, rotateX: 0, opacity: 1, duration: 1.5, ease: 'expo.out', clearProps: 'transform,opacity' }) });
  }
}

/* ---------- Szakaszhatár: minden szakasz papírlapként csúszik a előzőre, a felső éle a kupola íve (barack hajszálvonallal).
   Egérrel a görgetés lapítja ki a beérkezés alatt, érintőn egyszer, időre; nyugalomban egy kis csúcs megmarad. ---------- */
function setupCaps() {
  const REST = .12;
  // az első szakasz (a nyitókép alatt) egyenes éllel indul: a kezdőképen semmi nem lóg fel
  $$('.sec:not(.free)').forEach(sec => {
    const c = document.createElement('div'); c.className = 'cap'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path class="cap__f"/><path class="cap__l"/></svg>';
    sec.prepend(c);
    const [f, l] = $$('path', c), K = { k: 1 };
    const set = () => {
      const k = K.k, Y = t => (100 - 100 * k * t).toFixed(2);
      const d = `M0 100C300 100 360 ${Y(.55)} 430 ${Y(.8)}C470 ${Y(.93)} 492 ${Y(.975)} 500 ${Y(1)}C508 ${Y(.975)} 530 ${Y(.93)} 570 ${Y(.8)}C640 ${Y(.55)} 700 100 1000 100`;
      f.setAttribute('d', d + 'V101H0Z'); l.setAttribute('d', d);
    };
    // az első lap a nyitókép alján már nyugalomban van (különben betöltéskor belelógna a képbe)
    if (RM) { K.k = REST; set(); return; }
    set();
    if (FINE) gsap.to(K, { k: REST, ease: 'none', onUpdate: set, scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 28%', scrub: .6 } });
    else ScrollTrigger.create({ trigger: sec, start: 'top 96%', once: true, onEnter: () => gsap.to(K, { k: REST, duration: 1.6, ease: 'power2.inOut', onUpdate: set }) });
  });
}

/* ---------- Puha görgetés egérrel: Lenis a GSAP órájáról hajtva, érintőn natív görgetés ---------- */
let lenis = null;
function setupLenis() {
  if (!FINE || RM || !window.Lenis) return;
  lenis = new Lenis({ lerp: .085, wheelMultiplier: .9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

/* ---------- Kupola-kurzor: kis barack pötty, mögötte a kupola íve; linken összehúzódik, képen kitágul ---------- */
function setupCursor() {
  if (!FINE || RM) return;
  const c = document.createElement('div'); c.className = 'cur'; c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<span class="cur__f"><svg viewBox="0 0 12 22"><path d="M6 .6C6.5 3.4 7 5.6 6.9 7.4C6.8 8.6 6.4 9.3 6 9.6C5.6 9.3 5.2 8.6 5.1 7.4C5 5.6 5.5 3.4 6 .6Z"/><circle cx="6" cy="14.6" r="4.4"/></svg></span>';
  document.body.append(c);
  const F = $('.cur__f', c);
  let tx = -99, ty = -99, x = -99, y = -99, r = 0, raf = 0, seen = false;
  const loop = () => {
    const vx = tx - x;
    x += vx * .32; y += (ty - y) * .32;
    // mint egy kis inga: a mozgással ellentétes irányba dől, aztán visszaáll
    r += (Math.max(-22, Math.min(22, -vx * .9)) - r) * .18;
    F.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(r) > .15 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    if (!seen) { seen = true; x = tx; y = ty; c.classList.add('is-on'); HTML.classList.add('has-cur'); }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('mouseover', e => {
    const t = e.target; if (!t.closest) return;
    const link = !!t.closest('a, button, li[data-peek]');
    c.classList.toggle('is-link', link);
    c.classList.toggle('is-photo', !link && !!t.closest('.frame, .house__pic, .hero__win, .sh__img'));
    c.classList.toggle('is-dark', !!t.closest('.ft'));
  });
  document.addEventListener('mouseleave', () => c.classList.remove('is-on'));
  document.addEventListener('mouseenter', () => { if (seen) c.classList.add('is-on'); });
}

/* ---------- Gombok: a felirat felgördül, a kitöltés kupolaívként emelkedik; egérrel kicsit a mutató felé húzódnak ---------- */
function wrapBtns() {
  $$('.btn').forEach(b => {
    if ($('.btn__r', b)) return;
    const h = b.innerHTML.trim();
    b.innerHTML = `<span class="btn__r"><span>${h}</span><span aria-hidden="true">${h}</span></span>`;
  });
}
function setupMagnet() {
  if (!FINE || RM) return;
  $$('.btn').forEach(b => {
    const qx = gsap.quickTo(b, 'x', { duration: .6, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: .6, ease: 'power3.out' });
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * .22); qy((e.clientY - r.top - r.height / 2) * .3);
    });
    b.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}

/* ---------- Függöny-lábléc: egérrel a tartalom felhúzódik a lábléc elől (ha a lábléc elfér a képernyőn) ---------- */
function curtain() {
  const ft = $('.ft');
  HTML.classList.toggle('curtain', FINE && !RM && ft.offsetHeight < innerHeight - 60);
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
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && !RM) gsap.fromTo($$('#drawer nav a'), { yPercent: 60, rotate: 2, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.1, stagger: .07, delay: .42 });
  };
  bg.addEventListener('click', () => toggle(bg.getAttribute('aria-expanded') !== 'true'));
  $$('#drawer a').forEach(a => a.addEventListener('click', () => toggle(false)));
  $$('.lang button').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== lang) { applyLang(b.dataset.lang); requestAnimationFrame(() => { heroLayout(); ScrollTrigger.refresh(); curtain(); }); } }));
}

/* ---------- Horgonyok: natív, sima ugrás (a görgetést nem vesszük át, így az mindenhol a rendszeré marad) ---------- */
function setupAnchors() {
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || a.classList.contains('skip')) return;
    const t = id === '#top' ? null : $(id);
    if (id !== '#top' && !t) return;
    e.preventDefault();
    if (lenis) {
      // a helyet az offsetTop láncból számoljuk: a felemelkedő (döntött) kártya mérete így nem téveszt
      const pinned = t && (t.classList.contains('house') || t.classList.contains('shop'));
      const h = t && !pinned ? $('h2', t) : null;
      let y = 0, e = h || t;
      while (e) { y += e.offsetTop; e = e.offsetParent; }
      lenis.scrollTo(t ? Math.max(0, y - (h ? 130 : 0)) : 0, { duration: 1.6 });
    } else {
      const top = t ? t.getBoundingClientRect().top + scrollY : 0;
      scrollTo({ top, behavior: RM ? 'auto' : 'smooth' });
    }
    history.replaceState(null, '', id);
  }));
}

/* ---------- Indítás ---------- */
function reveals() {
  if (RM) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.3, stagger: .1, ease: EASE }) });
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
  wrapBtns();
  heroLayout();
  setupLenis();
  setupAnchors();
  setupHeader();
  buildStrikes();
  setupCaps();
  setupHouse();
  setupShop();
  setupFrames(null);
  setupCarts(null);
  setupOrns();
  setupSplits();
  setupPeek();
  setupLead(); leadReady = true;
  setupParallax();
  setupMenuRise();
  setupCursor();
  setupMagnet();
  setupGL();
  curtain();
  reveals();
  if (RM) {
    gsap.set('.hl', { strokeDashoffset: 0 }); gsap.set('#heroCur', { autoAlpha: 0 }); gsap.set($$('#heroH .w>span'), { yPercent: 0 });
    Z.p = 1; O.d = 1; H.lastO = -1; HTML.classList.add('hero-open'); heroRender();
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
    heroLayout(); buildStrikes(); if (houseResize) houseResize(); curtain(); if (G.resize) G.resize();
    $$('.frame').forEach(frameGeom); $$('[data-cart]').forEach(cartGeom);
    ScrollTrigger.refresh();
  });
  setInterval(hours, 60000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
