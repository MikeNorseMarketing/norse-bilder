// Felles hjelpere for /bilder-skriptene. Bare Node, ingen OS-spesifikke kommandoer.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

export const NETTLESER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
export const MOBIL_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

// Starter en nettleser. Prøver Playwright sin egen Chromium først, så Chrome og Edge
// som allerede ligger på maskinen. Da slipper mange å laste ned en ekstra nettleser.
export async function startNettleser(ekstraArgs = []) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    const feil = new Error(
      'Playwright er ikke installert ennå. Kjør: node .claude/skills/bilder/scripts/oppsett.mjs'
    );
    feil.code = 'MANGLER_PLAYWRIGHT';
    throw feil;
  }
  const forsok = [
    { navn: 'Chromium (Playwright)', valg: {} },
    { navn: 'Google Chrome', valg: { channel: 'chrome' } },
    { navn: 'Microsoft Edge', valg: { channel: 'msedge' } },
  ];
  const feilmeldinger = [];
  for (const f of forsok) {
    try {
      const browser = await chromium.launch({ headless: true, args: ekstraArgs, ...f.valg });
      return { browser, navn: f.navn };
    } catch (e) {
      feilmeldinger.push(`${f.navn}: ${String(e.message).split('\n')[0]}`);
    }
  }
  const feil = new Error('Fant ingen nettleser å bruke.\n' + feilmeldinger.join('\n'));
  feil.code = 'INGEN_NETTLESER';
  throw feil;
}

export function idag() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function lesArgs(argv) {
  const ut = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const navn = a.slice(2);
      const neste = argv[i + 1];
      if (neste !== undefined && !neste.startsWith('--')) {
        ut[navn] = neste;
        i++;
      } else ut[navn] = true;
    } else ut._.push(a);
  }
  return ut;
}

export function normaliserUrl(input) {
  if (!input) throw new Error('Mangler nettadresse. Eksempel: https://dinbedrift.no');
  let s = String(input).trim();
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  const u = new URL(s);
  u.hash = '';
  return u.toString();
}

export async function hent(url, valg = {}) {
  const kontroll = new AbortController();
  const tidsavbrudd = setTimeout(() => kontroll.abort(), valg.timeout || 20000);
  try {
    const res = await fetch(url, {
      redirect: valg.redirect || 'follow',
      signal: kontroll.signal,
      headers: { 'user-agent': NETTLESER_UA, 'accept-language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.5', ...(valg.headers || {}) },
    });
    const tekst = valg.kunStatus ? '' : await res.text();
    return { ok: res.ok, status: res.status, url: res.url, type: res.headers.get('content-type') || '', location: res.headers.get('location'), tekst };
  } catch (e) {
    return { ok: false, status: 0, url, type: '', tekst: '', feil: e.name === 'AbortError' ? 'tidsavbrudd' : e.message };
  } finally {
    clearTimeout(tidsavbrudd);
  }
}

export const ventLitt = (ms) => new Promise((r) => setTimeout(r, ms));

// Leser enkel frontmatter (nøkkel: verdi) fra en markdown-fil.
export function lesFrontmatter(tekst) {
  const ut = {};
  const m = String(tekst).replace(/\r/g, '').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return ut;
  for (const linje of m[1].split('\n')) {
    const x = linje.match(/^([\wæøåÆØÅ-]+)\s*:\s*(.*)$/);
    if (!x) continue;
    let v = x[2].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
    ut[x[1].toLowerCase()] = v;
  }
  return ut;
}
