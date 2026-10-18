// Henter farger, fonter og logo fra en nettside, som forslag til bedrift/merkevare.md.
// Bruk:  node .claude/skills/bilder/scripts/hent-merkevare.mjs https://dinbedrift.no
// Lagrer et skjermbilde (bedrift/nettside-skjermbilde.png) og logoen (bedrift/logo.png eller .svg) hvis den finnes.
// Sjekk alltid skjermbildet og logoen med egne øyne før du bruker forslagene.
import fs from 'node:fs';
import path from 'node:path';
import { ROT, startNettleser, lesArgs, hent, NETTLESER_UA } from './felles.mjs';

const args = lesArgs(process.argv.slice(2));
let url = args._[0];
if (!url) {
  console.log('Bruk: node .claude/skills/bilder/scripts/hent-merkevare.mjs https://dinbedrift.no');
  process.exit(1);
}
if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
const bedriftMappe = path.join(ROT, 'bedrift');
fs.mkdirSync(bedriftMappe, { recursive: true });

const { browser } = await startNettleser();
const kontekst = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, userAgent: NETTLESER_UA, locale: 'nb-NO' });
const page = await kontekst.newPage();
const svar = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => ({ feil: e.message }));
if (!svar || svar.feil) {
  console.log(`FEIL: klarte ikke å åpne ${url} (${svar?.feil || 'ukjent'}).`);
  await browser.close();
  process.exit(1);
}
await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1500);

// Prøv å lukke cookie-bokser, så de ikke farger analysen
for (const tekst of ['Godta alle', 'Godta', 'Aksepter alle', 'Aksepter', 'Tillat alle', 'Accept all', 'Accept', 'OK', 'Jeg forstår']) {
  const knapp = page.getByRole('button', { name: tekst, exact: true }).first();
  if (await knapp.isVisible().catch(() => false)) {
    await knapp.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(600);
    break;
  }
}

const data = await page.evaluate(() => {
  const tilHex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (a < 0.6) return null;
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  };
  const telle = (kart, farge, vekt) => {
    if (!farge) return;
    kart[farge] = (kart[farge] || 0) + vekt;
  };
  const bakgrunner = {};
  const tekster = {};
  const knapper = {};
  for (const el of document.querySelectorAll('body, body *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.top > 4000) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.3) continue;
    const areal = Math.min(r.width * r.height, 1280 * 900);
    telle(bakgrunner, tilHex(cs.backgroundColor), areal);
    const egenTekst = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (egenTekst) telle(tekster, tilHex(cs.color), egenTekst.length * parseFloat(cs.fontSize));
    const erKnapp = el.matches('button, [role="button"], a[class*="btn" i], a[class*="button" i], a[class*="knapp" i], input[type="submit"]');
    if (erKnapp) telle(knapper, tilHex(cs.backgroundColor), areal);
  }
  const topp = (kart, n) => Object.entries(kart).sort((a, b) => b[1] - a[1]).slice(0, n).map(([farge, vekt]) => ({ farge, vekt: Math.round(vekt) }));

  // CSS-variabler med farger (mange temaer har merkefargene her)
  const variabler = {};
  for (const ark of document.styleSheets) {
    let regler;
    try { regler = ark.cssRules; } catch { continue; }
    for (const regel of regler || []) {
      if (!regel.style || !/^(:root|html|body)$/.test(regel.selectorText || '')) continue;
      for (const navn of regel.style) {
        if (!navn.startsWith('--')) continue;
        const v = regel.style.getPropertyValue(navn).trim();
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) || /^rgba?\(/i.test(v)) variabler[navn] = v;
      }
    }
  }

  const font = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim() : null;
  };
  const vekt = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontWeight : null;
  };

  // Logo: JSON-LD, så bilde eller svg i toppen med «logo» i navnet, så lenke til forsiden
  let ldLogo = null;
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const finn = (o) => {
        if (!o || typeof o !== 'object' || ldLogo) return;
        if (Array.isArray(o)) return o.forEach(finn);
        if (o.logo) ldLogo = typeof o.logo === 'string' ? o.logo : o.logo.url || o.logo.contentUrl || null;
        Object.values(o).forEach(finn);
      };
      finn(JSON.parse(s.textContent));
    } catch {}
  }
  const iToppen = (el) => el.getBoundingClientRect().top < 260;
  const kandidater = [...document.querySelectorAll('header img, header svg, nav img, nav svg, a[href="/"] img, a[href="/"] svg, img, svg')].filter((el) => {
    const r = el.getBoundingClientRect();
    if (!iToppen(el) || r.width < 30 || r.height < 12 || r.width > 600) return false;
    const tekst = [el.getAttribute('src'), el.getAttribute('alt'), el.getAttribute('class'), el.id, el.closest('a')?.getAttribute('class'), el.closest('a')?.getAttribute('href'), el.closest('[class*="logo" i]') ? 'logo' : ''].join(' ').toLowerCase();
    return /logo|brand|merke/.test(tekst) || el.closest('a')?.getAttribute('href') === '/' || el.closest('a')?.href === location.origin + '/';
  });
  const logoEl = kandidater[0] || null;
  let logo = null;
  if (logoEl) {
    logoEl.setAttribute('data-merkevare-logo', '1');
    const r = logoEl.getBoundingClientRect();
    logo = { type: logoEl.tagName.toLowerCase(), src: logoEl.currentSrc || logoEl.getAttribute('src') || null, bredde: Math.round(r.width), hoyde: Math.round(r.height) };
  }
  return {
    tittel: document.title,
    bakgrunner: topp(bakgrunner, 8),
    tekstfarger: topp(tekster, 6),
    knappefarger: topp(knapper, 6),
    variabler,
    fonter: { overskrift: font('h1') || font('h2'), tekst: font('p') || font('body'), knapp: font('button') || font('a'), vektOverskrift: vekt('h1') || vekt('h2') },
    ldLogo,
    logo,
  };
});

await page.screenshot({ path: path.join(bedriftMappe, 'nettside-skjermbilde.png') });

// Lagre logoen. Finnes det allerede en logo i bedrift/, røres den ikke uten --overskriv.
const finnes = fs.readdirSync(bedriftMappe).filter((f) => /^logo\.(png|svg|jpe?g|webp)$/i.test(f));
let logoFil = null;
if (finnes.length && !args.overskriv) {
  logoFil = path.join('bedrift', finnes[0]);
  console.log(`Logo finnes allerede: ${logoFil} (bruk --overskriv for å hente på nytt).`);
} else {
  const lagre = (buf, ext) => {
    const fil = path.join(bedriftMappe, `logo.${ext}`);
    fs.writeFileSync(fil, buf);
    return path.join('bedrift', `logo.${ext}`);
  };
  const kilde = data.logo?.src && !data.logo.src.startsWith('data:') ? new URL(data.logo.src, page.url()).toString() : !data.logo && data.ldLogo ? new URL(data.ldLogo, page.url()).toString() : null;
  const extFraType = (type) => (type.includes('svg') ? 'svg' : type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('jpeg') || type.includes('jpg') ? 'jpg' : null);
  // 1. Logoen ligger rett i siden som data-URI: lagre den som den er
  const dataUriMatch = data.logo?.src?.match(/^data:(image\/[\w+.-]+)(;base64)?,(.*)$/s);
  if (dataUriMatch) {
    const ext = extFraType(dataUriMatch[1]);
    const buf = dataUriMatch[2] ? Buffer.from(dataUriMatch[3], 'base64') : Buffer.from(decodeURIComponent(dataUriMatch[3]));
    if (ext) logoFil = lagre(buf, ext);
  }
  // 2. Vanlig bildefil: last den ned
  if (!logoFil && kilde) {
    const r = await page.request.get(kilde).catch(() => null);
    if (r && r.ok()) {
      const ext = extFraType(r.headers()['content-type'] || '') || extFraType(kilde.split('?')[0].split('.').pop());
      if (ext) logoFil = lagre(await r.body(), ext);
    }
  }
  // 3. SVG rett i siden: lagre som .svg med fargene den faktisk vises i
  if (!logoFil && data.logo?.type === 'svg') {
    const svg = await page.locator('[data-merkevare-logo="1"]').first().evaluate((node) => {
      const kopi = node.cloneNode(true);
      const orig = [node, ...node.querySelectorAll('*')];
      const kopier = [kopi, ...kopi.querySelectorAll('*')];
      orig.forEach((el, i) => {
        const cs = getComputedStyle(el);
        if (cs.fill && cs.fill !== 'none') kopier[i].setAttribute('fill', cs.fill);
        if (cs.stroke && cs.stroke !== 'none') kopier[i].setAttribute('stroke', cs.stroke);
      });
      const r = node.getBoundingClientRect();
      kopi.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      if (!kopi.getAttribute('viewBox')) kopi.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      kopi.setAttribute('width', Math.round(r.width));
      kopi.setAttribute('height', Math.round(r.height));
      return kopi.outerHTML;
    }).catch(() => null);
    if (svg && !/<use\b/i.test(svg)) logoFil = lagre(Buffer.from(svg), 'svg');
  }
  // 4. Siste utvei: skjermbilde av bare logoen, med alt annet skjult
  if (!logoFil && data.logo) {
    await page.addStyleTag({ content: 'html, body { background: transparent !important; } body * { visibility: hidden !important; } [data-merkevare-logo], [data-merkevare-logo] * { visibility: visible !important; }' });
    const el = page.locator('[data-merkevare-logo="1"]').first();
    await el.evaluate((node) => { for (let e = node; e; e = e.parentElement) e.style.setProperty('background', 'transparent', 'important'); });
    const buf = await el.screenshot({ omitBackground: true }).catch(() => null);
    if (buf) logoFil = lagre(buf, 'png');
  }
}
await browser.close();

// Finnes fontene på Google Fonts?
async function paGoogle(navn) {
  if (!navn) return false;
  const r = await hent(`https://fonts.googleapis.com/css2?family=${navn.trim().replace(/\s+/g, '+')}`, { timeout: 10000 });
  return r.ok;
}
const f = data.fonter;
const googleO = await paGoogle(f.overskrift);
const googleT = await paGoogle(f.tekst);

console.log(`NETTSIDE: ${url} (${data.tittel})`);
console.log(`Skjermbilde: bedrift/nettside-skjermbilde.png (se på det før du velger farger)`);
console.log(`Logo: ${logoFil || 'fant ingen. Be brukeren legge logoen i bedrift/ som logo.png eller logo.svg'}`);
console.log(`\nBakgrunnsfarger (mest brukt først): ${data.bakgrunner.map((x) => x.farge).join(', ')}`);
console.log(`Tekstfarger: ${data.tekstfarger.map((x) => x.farge).join(', ')}`);
console.log(`Knappefarger: ${data.knappefarger.map((x) => x.farge).join(', ') || 'ingen funnet'}`);
const vars = Object.entries(data.variabler).slice(0, 16);
if (vars.length) console.log(`CSS-variabler: ${vars.map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`\nFont overskrift: ${f.overskrift || 'ukjent'} (vekt ${f.vektOverskrift || '?'})${googleO ? ', finnes på Google Fonts' : ', IKKE på Google Fonts, velg en lignende'}`);
console.log(`Font tekst: ${f.tekst || 'ukjent'}${googleT ? ', finnes på Google Fonts' : ', IKKE på Google Fonts, velg en lignende'}`);
