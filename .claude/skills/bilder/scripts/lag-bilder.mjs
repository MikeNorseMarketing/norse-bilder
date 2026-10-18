// Lager ferdige PNG-innlegg fra en innlegg.json, i merkevaren fra bedrift/merkevare.md.
// Bruk:  node .claude/skills/bilder/scripts/lag-bilder.mjs output/bilder/ÅÅÅÅ-MM-DD/innlegg.json [--apne]
// Lager 01.png, 02.png ... , tekster.md og oversikt.html i samme mappe som innlegg.json.
// Sjekker at teksten får plass, at kontrasten er god, at fontene lastet og at teksten følger skrivereglene.
// Avslutter med kode 0 når alt er i orden, og kode 2 når noe må rettes (bildene lages likevel).
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { ROT, startNettleser, lesArgs, lesFrontmatter, hent } from './felles.mjs';
import { LAYOUTER, byggInnhold, css, ren, fmt } from './layouter.mjs';
import { sjekkTekst } from './sjekk-tekst.mjs';

const args = lesArgs(process.argv.slice(2));
const specFil = args._[0] ? path.resolve(args._[0]) : null;
if (!specFil || !fs.existsSync(specFil)) {
  console.log('Bruk: node .claude/skills/bilder/scripts/lag-bilder.mjs <mappe>/innlegg.json');
  process.exit(1);
}
const mappe = path.dirname(specFil);
let spec;
try {
  spec = JSON.parse(fs.readFileSync(specFil, 'utf8'));
} catch (e) {
  console.log(`FEIL: innlegg.json er ikke gyldig JSON (${e.message}).`);
  process.exit(1);
}
const problemer = [];
const merknader = [];

// ---------- merkevare ----------
const merkevareFil = path.resolve(ROT, spec.merkevare || 'bedrift/merkevare.md');
if (!fs.existsSync(merkevareFil)) {
  console.log(`FEIL: fant ikke ${merkevareFil}. Fyll ut bedrift/merkevare.md først.`);
  process.exit(1);
}
const mv = lesFrontmatter(fs.readFileSync(merkevareFil, 'utf8'));
if (mv.status === 'tom') {
  console.log('FEIL: bedrift/merkevare.md har status: tom. Fyll den ut først.');
  process.exit(1);
}

const erHex = (s) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(s || '').trim());
const hex = (s) => {
  let h = String(s).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return '#' + h.toLowerCase();
};
const rgb = (h) => [1, 3, 5].map((i) => parseInt(hex(h).slice(i, i + 2), 16));
const lum = (h) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = rgb(h);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const kontrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const bland = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const best = (bg, kandidater) => kandidater.filter(erHex).map(hex).sort((x, y) => kontrast(bg, y) - kontrast(bg, x))[0];
const forsteMed = (bg, kandidater, min) => kandidater.filter(erHex).map(hex).find((c) => c !== hex(bg) && kontrast(bg, c) >= min);

for (const felt of ['farge_primar', 'farge_aksent']) {
  if (!erHex(mv[felt])) problemer.push(`merkevare.md: ${felt} mangler eller er ikke en hex-farge (for eksempel #1f3a2e).`);
}
if (problemer.length) {
  console.log('FEIL:\n' + problemer.join('\n'));
  process.exit(1);
}
const F = {
  primar: hex(mv.farge_primar),
  aksent: hex(mv.farge_aksent),
  mork: erHex(mv.farge_mork) ? hex(mv.farge_mork) : '#141414',
  lys: erHex(mv.farge_lys) ? hex(mv.farge_lys) : '#ffffff',
};

function palett(stil) {
  let bg;
  if (stil === 'lys') bg = F.lys;
  else if (stil === 'mork') bg = F.mork;
  else bg = F.primar;
  const tekst = best(bg, [F.mork, F.lys, '#111111', '#ffffff']);
  let aksent = forsteMed(bg, stil === 'farge' ? [F.aksent, F.lys, '#ffffff', F.mork] : [F.aksent, F.primar, tekst], 3);
  if (aksent !== hex(F.aksent) && stil !== 'farge') merknader.push(`Aksentfargen ${F.aksent} har for svak kontrast mot ${stil} bakgrunn, brukte ${aksent} i stedet.`);
  if (!aksent) aksent = tekst;
  let dempet = bland(tekst, bg, 0.22);
  if (kontrast(bg, dempet) < 4.5) dempet = bland(tekst, bg, 0.1);
  if (kontrast(bg, dempet) < 4.5) dempet = tekst;
  const knappBg = stil === 'farge' ? (kontrast(bg, F.aksent) >= 1.6 ? F.aksent : best(bg, [F.mork, F.lys])) : kontrast(bg, F.aksent) >= 1.6 ? F.aksent : F.primar;
  const knappTekst = best(knappBg, ['#ffffff', F.mork, '#111111']);
  const paaAksent = best(aksent, ['#ffffff', F.mork, '#111111']);
  const markor = aksent === tekst ? (lum(tekst) < 0.3 ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.3)') : null;
  return {
    markor,
    bg,
    tekst,
    dempet,
    aksent,
    paaAksent,
    knappBg,
    knappTekst,
    flate: bland(bg, tekst, 0.07),
    linje: bland(bg, tekst, 0.16),
    morkBakgrunn: lum(bg) < 0.25,
  };
}

// ---------- fonter ----------
async function fontCss(navn, vekter, alias) {
  if (!navn) return { css: '', familie: 'system-ui', navn: 'systemfont' };
  if (/\.(woff2?|ttf|otf)$/i.test(navn)) {
    const fil = path.resolve(ROT, navn);
    if (!fs.existsSync(fil)) {
      problemer.push(`Fant ikke fontfila ${navn}.`);
      return { css: '', familie: 'system-ui', navn };
    }
    const ext = path.extname(fil).slice(1).toLowerCase();
    const format = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' }[ext];
    const data = fs.readFileSync(fil).toString('base64');
    return { css: `@font-face{font-family:'${alias}';src:url(data:font/${ext};base64,${data}) format('${format}');font-weight:100 900;}`, familie: `'${alias}'`, navn };
  }
  const fam = navn.trim().replace(/\s+/g, '+');
  for (const v of [`:wght@${vekter.join(';')}`, ':wght@400;700', '']) {
    const url = `https://fonts.googleapis.com/css2?family=${fam}${v}&display=block`;
    const r = await hent(url, { timeout: 15000 });
    if (r.ok && r.tekst.includes('@font-face')) return { lenke: url, familie: `'${navn.trim()}'`, navn: navn.trim() };
  }
  problemer.push(`Fonten «${navn}» finnes ikke på Google Fonts (eller nettet svarer ikke). Velg en annen i merkevare.md, eller legg fontfila i bedrift/ og skriv stien.`);
  return { css: '', familie: 'system-ui', navn };
}
const vektO = Number(mv.vekt_overskrift) || 700;
const fontO = await fontCss(mv.font_overskrift, [...new Set([500, 600, vektO])].sort(), 'MerkeOverskrift');
const fontT = await fontCss(mv.font_tekst || mv.font_overskrift, [400, 500, 600, 700], 'MerkeTekst');

// ---------- filer (logo og bilder) som data-URI ----------
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif', avif: 'image/avif' };
function dataUri(rel, hva) {
  if (!rel) return null;
  const fil = path.resolve(ROT, rel);
  if (!fs.existsSync(fil)) {
    problemer.push(`Fant ikke ${hva} ${rel}.`);
    return null;
  }
  const ext = path.extname(fil).slice(1).toLowerCase();
  if (!MIME[ext]) {
    problemer.push(`${rel} har et format som ikke støttes (${ext}). Bruk JPG, PNG, WEBP eller SVG. Bilder fra iPhone (HEIC) kan eksporteres som JPG.`);
    return null;
  }
  return `data:${MIME[ext]};base64,${fs.readFileSync(fil).toString('base64')}`;
}
const logo = dataUri(mv.logo, 'logoen');
const logoLys = dataUri(mv.logo_lys, 'den lyse logoen');
if (!mv.logo) merknader.push('Ingen logo i merkevare.md. Bruker bedriftsnavnet som tekst i stedet.');
const bunntekst = spec.bunntekst ?? (mv.nettside || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

// ---------- format ----------
const [W, H] = String(spec.format || '1080x1350').split('x').map(Number);
if (![1350, 1080].includes(H) || W !== 1080) {
  console.log('FEIL: format må være "1080x1350" eller "1080x1080".');
  process.exit(1);
}

// ---------- valider innleggene ----------
const innlegg = spec.innlegg || [];
if (!innlegg.length) {
  console.log('FEIL: innlegg.json har ingen innlegg.');
  process.exit(1);
}
innlegg.forEach((p, i) => {
  p.nr = p.nr || i + 1;
  const def = LAYOUTER[p.layout];
  if (!def) return problemer.push(`Innlegg ${p.nr}: ukjent layout «${p.layout}». Velg mellom ${Object.keys(LAYOUTER).join(', ')}.`);
  for (const f of def.felt) {
    const v = p[f];
    if (v === undefined || v === null || (Array.isArray(v) ? !v.length : !String(v).trim())) problemer.push(`Innlegg ${p.nr} (${p.layout}): mangler feltet «${f}».`);
  }
  if (!p.bildetekst) problemer.push(`Innlegg ${p.nr}: mangler bildetekst.`);
  const tekst = JSON.stringify(p);
  if (/\[Mangler/i.test(tekst)) problemer.push(`Innlegg ${p.nr}: inneholder [Mangler: ...]. Bytt til en annen type innlegg eller få svaret fra brukeren.`);
});
if (problemer.length) {
  console.log('FEIL:\n' + problemer.join('\n'));
  process.exit(1);
}

// Skriveregler på all tekst
const TEKSTFELT = ['vinkel', 'etikett', 'overskrift', 'undertekst', 'punkter', 'knapp', 'pris', 'prisTekst', 'sitat', 'navn', 'rolle', 'resultat', 'resultatTekst', 'for', 'etter', 'tall', 'forklaring', 'kilde', 'myte', 'fakta', 'kontakt', 'bildetekst', 'alt'];
for (const p of innlegg) {
  const linjer = [];
  for (const f of TEKSTFELT) {
    if (p[f] === undefined) continue;
    const verdier = Array.isArray(p[f]) ? p[f] : [p[f]];
    for (const v of verdier) for (const l of String(v).replace(/\\n/g, '\n').split('\n')) linjer.push((['overskrift', 'etikett'].includes(f) ? '# ' : '') + l.replace(/\*\*/g, ''));
  }
  const { feil } = sjekkTekst(linjer.join('\n'));
  feil.forEach((f) => problemer.push(`Innlegg ${p.nr}: ${f.replace(/^linje \d+: /, '')}`));
}

// ---------- side-skript: tilpass tekst, sjekk kontrast og logo ----------
const SIDE_SKRIPT = `
(async () => {
  await document.fonts.ready;
  for (const img of document.images) { try { await img.decode(); } catch {} }
  const rapport = { overflyt: [], kontrast: [], smaTekster: [], logoBrikke: false, fonter: {} };
  const over = (b) => b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1;
  const fitEls = [...document.querySelectorAll('[data-fit]')];
  // 1. Lange ord: krymp til ordet får plass i bredden
  for (const el of fitEls) {
    let s = parseFloat(getComputedStyle(el).fontSize); const min = +el.dataset.fit;
    while (el.scrollWidth > el.clientWidth + 1 && s > min) { s = Math.max(min, s * 0.95); el.style.fontSize = s + 'px'; }
  }
  // 2. For mye tekst i høyden: krymp alt i boksen litt om gangen
  const bokser = [...document.querySelectorAll('[data-boks]')];
  for (const b of bokser) {
    let runder = 0;
    while (over(b) && runder++ < 80) {
      let endret = false;
      for (const el of b.querySelectorAll('[data-fit]')) {
        const s = parseFloat(getComputedStyle(el).fontSize); const min = +el.dataset.fit;
        if (s > min + 0.5) { el.style.fontSize = Math.max(min, s * 0.96) + 'px'; endret = true; }
      }
      if (!endret) break;
    }
  }
  // 3. Kort tekst og mye luft: vokse teksten litt, så bildet fylles bedre (maks 35 prosent)
  const minLuft = ${H >= 1350 ? 110 : 80};
  for (const b of bokser) {
    const egne = [...b.querySelectorAll('[data-fit]')].filter((el) => el.closest('[data-boks]') === b);
    if (!egne.length) continue;
    const start = new Map(egne.map((el) => [el, parseFloat(getComputedStyle(el).fontSize)]));
    const vokser = [...b.children].filter((c) => c.classList.contains('vokser'));
    const luft = () => (vokser.length ? vokser.reduce((sum, v) => sum + v.getBoundingClientRect().height, 0) : b.clientHeight - [...b.children].reduce((sum, c) => sum + c.getBoundingClientRect().height, 0));
    const faktor = new Map(egne.map((el) => [el, 1]));
    const ferdig = new Set();
    for (let runde = 0; runde < 12 && ferdig.size < egne.length; runde++) {
      const forsok = egne.filter((el) => !ferdig.has(el));
      forsok.forEach((el) => (el.style.fontSize = start.get(el) * Math.min(1.35, faktor.get(el) + 0.04) + 'px'));
      // Elementer som blir for brede, stopper der de var. De andre kan vokse videre.
      const vokste = [];
      for (const el of forsok) {
        if (el.scrollWidth > el.clientWidth + 1) {
          el.style.fontSize = start.get(el) * faktor.get(el) + 'px';
          ferdig.add(el);
        } else vokste.push(el);
      }
      if (over(b) || luft() < minLuft) {
        vokste.forEach((el) => (el.style.fontSize = start.get(el) * faktor.get(el) + 'px'));
        break;
      }
      for (const el of vokste) {
        faktor.set(el, Math.min(1.35, faktor.get(el) + 0.04));
        if (faktor.get(el) >= 1.35) ferdig.add(el);
      }
    }
  }
  for (const b of bokser) if (over(b)) rapport.overflyt.push(b.dataset.boks);
  for (const el of fitEls) if (el.scrollWidth > el.clientWidth + 1) rapport.overflyt.push('ord for langt: ' + el.textContent.trim().slice(0, 40));
  // 3. Kontrast
  const parse = (c) => { const m = c.match(/[\\d.]+/g); return m ? m.map(Number) : [0,0,0,0]; };
  const L = ([r,g,b]) => { const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const K = (a, b) => { const x = Math.max(L(a), L(b)), y = Math.min(L(a), L(b)); return (x + 0.05) / (y + 0.05); };
  const bakgrunn = (el) => { for (let e = el; e; e = e.parentElement) { if (e.classList?.contains('panel-foto') || e.classList?.contains('paa-foto')) return null; const c = parse(getComputedStyle(e).backgroundColor); if (c.length < 4 || c[3] > 0.5) return c.slice(0,3); } return [255,255,255]; };
  const tekstEls = [...document.querySelectorAll('.innhold *, .bunn *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of tekstEls) {
    const cs = getComputedStyle(el); const bg = bakgrunn(el); const size = parseFloat(cs.fontSize);
    if (size < 22) rapport.smaTekster.push(el.textContent.trim().slice(0, 40) + ' (' + Math.round(size) + 'px)');
    if (!bg) continue;
    const c = parse(cs.color); if (c[3] !== undefined && c[3] < 0.5) continue;
    const k = K(c.slice(0,3), bg); const krav = size >= 60 ? 3 : 4.5;
    if (k < krav) rapport.kontrast.push(el.textContent.trim().slice(0, 40) + ' (kontrast ' + k.toFixed(1) + ', krav ' + krav + ')');
  }
  // 4. Logo: trenger den en lys eller mørk brikke bak seg?
  const img = document.querySelector('.logo img');
  if (img) {
    try {
      const c = document.createElement('canvas'); const w = 300; const h = Math.max(1, Math.round(w * (img.naturalHeight || 100) / (img.naturalWidth || 300)));
      c.width = w; c.height = h; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h).data; let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i+3] > 128) { r += d[i]; g += d[i+1]; b += d[i+2]; n++; }
      if (n) {
        const snitt = [r/n, g/n, b/n];
        const bunn = document.querySelector('.bunn'); const bg = bakgrunn(bunn) || [20,20,20];
        rapport.logoKontrast = +K(snitt, bg).toFixed(2);
        rapport.logoDekning = +(n / (w*h)).toFixed(2);
        if (rapport.logoKontrast < 3 && rapport.logoDekning < 0.9) {
          const brikke = L(snitt) < 0.4 ? '#ffffff' : '${F.mork}';
          document.querySelector('.logo').classList.add('brikke');
          document.querySelector('.logo').style.setProperty('--brikke', brikke);
          rapport.logoBrikke = brikke;
        }
      }
    } catch (e) { rapport.logoFeil = String(e); }
  }
  // Lastet minst én variant av hver font? (Ikke alle bilder bruker alle vektene.)
  const lastet = (variabel) => {
    const navn = getComputedStyle(document.documentElement).getPropertyValue(variabel).trim().replace(/^['"]|['"]$/g, '');
    if (!navn || navn === 'system-ui') return true;
    return [...document.fonts].some((f) => f.family.replace(/^['"]|['"]$/g, '') === navn && f.status === 'loaded');
  };
  rapport.fonter.overskrift = lastet('--f-o');
  rapport.fonter.tekst = lastet('--f-t');
  window.__rapport = rapport;
})();
`;

function html(p, pal, bilder) {
  const innhold = byggInnhold(p, bilder);
  const paaFoto = innhold.ramme.includes('paa-foto');
  const brukLogo = (pal.morkBakgrunn || paaFoto) && logoLys ? logoLys : logo;
  const logoHtml = brukLogo ? `<div class="logo"><img src="${brukLogo}" alt=""></div>` : `<div class="ordmerke">${fmt(mv.navn || '')}</div>`;
  const lenker = [fontO.lenke, fontT.lenke].filter(Boolean).map((u) => `<link rel="stylesheet" href="${u}">`).join('\n');
  return `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${lenker}
<style>
${fontO.css || ''}${fontT.css || ''}
:root {
  --bg: ${pal.bg}; --tekst: ${pal.tekst}; --dempet: ${pal.dempet}; --aksent: ${pal.aksent}; --paa-aksent: ${pal.paaAksent};
  --knapp-bg: ${pal.knappBg}; --knapp-tekst: ${pal.knappTekst}; --flate: ${pal.flate}; --linje: ${pal.linje};
  --f-o: ${fontO.familie}; --f-t: ${fontT.familie}; --vekt-o: ${vektO};
}
${css(W, H)}
</style></head><body>
<div class="ramme ${innhold.ramme}${pal.markor ? ' hl-markor' : ''}" style="${pal.markor ? `--markor:${pal.markor}` : ''}">
  ${innhold.bak}
  ${innhold.topp || ''}
  <div class="innhold" data-boks="innhold">${innhold.html}</div>
  <div class="bunn">${logoHtml}<div class="nettside">${fmt(bunntekst)}</div></div>
</div>
<script>${SIDE_SKRIPT}</script>
</body></html>`;
}

// ---------- tegn ----------
const { browser, navn: nettleserNavn } = await startNettleser();
const side = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const resultat = [];
for (const p of innlegg) {
  const stil = p.stil || LAYOUTER[p.layout].stil;
  const pal = palett(stil);
  const bilder = {};
  for (const f of ['bilde', 'bildeFor', 'bildeEtter']) if (p[f]) bilder[f] = dataUri(p[f], 'bildet');
  const filnavn = String(p.nr).padStart(2, '0') + '.png';
  await side.setContent(html(p, pal, bilder), { waitUntil: 'networkidle', timeout: 60000 });
  await side.waitForFunction(() => window.__rapport, null, { timeout: 30000 });
  const r = await side.evaluate(() => window.__rapport);
  await side.screenshot({ path: path.join(mappe, filnavn), clip: { x: 0, y: 0, width: W, height: H } });
  const funn = [];
  if (r.overflyt.length) funn.push(`teksten får ikke plass (${r.overflyt.join(', ')}). Kort ned teksten.`);
  if (r.kontrast.length) funn.push(`for svak kontrast: ${r.kontrast.join(' | ')}`);
  if (!r.fonter.overskrift && fontO.lenke) funn.push(`overskriftfonten ${fontO.navn} lastet ikke`);
  if (!r.fonter.tekst && fontT.lenke) funn.push(`tekstfonten ${fontT.navn} lastet ikke`);
  if (r.smaTekster.length) merknader.push(`Innlegg ${p.nr}: liten tekst som kan bli vanskelig å lese på mobil: ${r.smaTekster.slice(0, 3).join(' | ')}`);
  funn.forEach((f) => problemer.push(`Innlegg ${p.nr} (${p.layout}): ${f}`));
  resultat.push({ p, filnavn, stil, logoBrikke: r.logoBrikke, logoKontrast: r.logoKontrast });
}
await browser.close();

// ---------- tekster.md ----------
const dato = path.basename(mappe);
const tekstIBildet = (p) =>
  ['etikett', 'resultat', 'resultatTekst', 'overskrift', 'tall', 'sitat', 'myte', 'fakta', 'for', 'etter', 'undertekst', 'forklaring', 'punkter', 'pris', 'prisTekst', 'knapp', 'navn', 'rolle', 'kontakt', 'kilde']
    .filter((f) => p[f])
    .map((f) => (Array.isArray(p[f]) ? p[f].map(ren).join('. ') : ren(p[f])))
    .join(' / ');
const par = [];
for (let i = 0; i < resultat.length; i += 2) par.push(resultat.slice(i, i + 2).map((x) => x.filnavn.replace('.png', '')).join(' og '));
const md = [
  `# Innlegg ${dato}`,
  '',
  `${resultat.length} innlegg i ${W}x${H}. Bildene ligger i samme mappe.`,
  '',
  `Forslag til rekkefølge: ${par.map((x, i) => `uke ${i + 1}: ${x}`).join(', ')}.`,
  '',
  ...resultat.flatMap(({ p, filnavn }) => [
    `## ${filnavn.replace('.png', '')} ${LAYOUTER[p.layout].navn}`,
    '',
    ...(p.vinkel ? [`Vinkel: ${ren(p.vinkel)}`, ''] : []),
    `Tekst i bildet: ${tekstIBildet(p)}`,
    '',
    'Bildetekst til Instagram og Facebook:',
    '',
    String(p.bildetekst).replace(/\\n/g, '\n'),
    '',
    `Alt-tekst: ${p.alt ? ren(p.alt) : tekstIBildet(p)}`,
    '',
  ]),
].join('\n');
fs.writeFileSync(path.join(mappe, 'tekster.md'), md);

// ---------- oversikt.html ----------
const e = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const kort = resultat
  .map(
    ({ p, filnavn }) => `
  <article class="kort">
    <a href="${filnavn}" target="_blank"><img src="${filnavn}" alt="${e(tekstIBildet(p))}" loading="lazy"></a>
    <div class="info">
      <div class="topp"><span class="nr">${filnavn.replace('.png', '')}</span><span class="type">${e(LAYOUTER[p.layout].navn)}</span></div>
      <pre class="tekst">${e(String(p.bildetekst).replace(/\\n/g, '\n'))}</pre>
      <button type="button" data-kopier>Kopier bildetekst</button>
    </div>
  </article>`
  )
  .join('');
const oversikt = `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Innlegg ${e(dato)}${mv.navn ? ' for ' + e(mv.navn) : ''}</title>
<style>
  :root { --bg: #f4f2ee; --kort: #ffffff; --tekst: #1b1b1b; --dempet: #66625b; --linje: #e4e0d8; --aksent: ${F.primar}; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--tekst); font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.5; }
  header { max-width: 1240px; margin: 0 auto; padding: 40px 20px 8px; }
  h1 { margin: 0 0 6px; font-size: 28px; letter-spacing: -0.01em; }
  header p { margin: 0; color: var(--dempet); }
  main { max-width: 1240px; margin: 0 auto; padding: 24px 20px 60px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  .kort { background: var(--kort); border: 1px solid var(--linje); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
  .kort img { display: block; width: 100%; height: auto; border-bottom: 1px solid var(--linje); }
  .info { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .topp { display: flex; align-items: center; gap: 10px; }
  .nr { font-weight: 700; background: var(--aksent); color: #fff; border-radius: 6px; padding: 1px 8px; font-size: 13px; }
  .type { color: var(--dempet); font-size: 14px; }
  .tekst { margin: 0; white-space: pre-wrap; font: inherit; font-size: 14px; flex: 1; }
  button { align-self: flex-start; border: 1px solid var(--linje); background: #fff; border-radius: 8px; padding: 7px 12px; font: inherit; font-size: 14px; cursor: pointer; }
  button:hover { border-color: var(--dempet); }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #161616; --kort: #1f1f1f; --tekst: #f2f2f2; --dempet: #a8a39b; --linje: #333; }
    button { background: #262626; color: var(--tekst); }
  }
</style>
</head>
<body>
<header>
  <h1>${resultat.length} innlegg${mv.navn ? ' for ' + e(mv.navn) : ''}</h1>
  <p>${e(dato)}. Klikk på et bilde for å åpne det i full størrelse. Bildetekstene ligger også i tekster.md.</p>
</header>
<main>${kort}
</main>
<script>
  document.querySelectorAll('[data-kopier]').forEach((knapp) => {
    knapp.addEventListener('click', async () => {
      const tekst = knapp.parentElement.querySelector('.tekst').textContent;
      try { await navigator.clipboard.writeText(tekst); knapp.textContent = 'Kopiert'; }
      catch { const r = document.createRange(); r.selectNodeContents(knapp.parentElement.querySelector('.tekst')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); knapp.textContent = 'Merket, trykk Cmd+C eller Ctrl+C'; }
      setTimeout(() => (knapp.textContent = 'Kopier bildetekst'), 2500);
    });
  });
</script>
</body>
</html>`;
fs.writeFileSync(path.join(mappe, 'oversikt.html'), oversikt);

// ---------- rapport ----------
console.log(`Laget ${resultat.length} bilder i ${W}x${H} med ${nettleserNavn}:`);
for (const r of resultat) console.log(`  ${r.filnavn}  ${r.p.layout} (${r.stil})${r.logoBrikke ? `, logo på ${r.logoBrikke} brikke for kontrast` : ''}`);
console.log(`Fonter: overskrift ${fontO.navn}, tekst ${fontT.navn}`);
console.log(`Tekster: ${path.join(mappe, 'tekster.md')}`);
console.log(`Oversikt: ${path.join(mappe, 'oversikt.html')}`);
const lagSett = new Set(resultat.map((r) => r.p.layout));
if (resultat.length >= 6 && lagSett.size < 5) merknader.push(`Bare ${lagSett.size} ulike layouter i bunken. Bland gjerne inn flere typer.`);
for (let i = 1; i < resultat.length; i++) if (resultat[i].p.layout === resultat[i - 1].p.layout && resultat[i].stil === resultat[i - 1].stil) merknader.push(`Innlegg ${resultat[i - 1].p.nr} og ${resultat[i].p.nr} har samme layout og stil etter hverandre. Bytt rekkefølge eller stil.`);
if (merknader.length) console.log('\nMERKNADER:\n' + [...new Set(merknader)].join('\n'));
if (problemer.length) {
  console.log('\nMÅ RETTES:\n' + problemer.join('\n'));
  console.log('\nRett innlegg.json (eller merkevare.md) og kjør skriptet på nytt.');
  process.exit(2);
}
console.log('\nAlt ser riktig ut. Se likevel på bildene før du leverer.');
if (args.apne) {
  const fil = path.join(mappe, 'oversikt.html');
  const kommando = process.platform === 'win32' ? `start "" "${fil}"` : process.platform === 'darwin' ? `open "${fil}"` : `xdg-open "${fil}"`;
  exec(kommando, () => {});
}
