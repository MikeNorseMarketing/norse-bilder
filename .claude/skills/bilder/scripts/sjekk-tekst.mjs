// Sjekker norsk tekst mot skrivereglene før levering.
// Bruk:  node .claude/skills/bilder/scripts/sjekk-tekst.mjs output/bilder/ÅÅÅÅ-MM-DD/tekster.md
// Avslutter med kode 1 hvis teksten har feil som må rettes.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const AI_ORD = [
  'sømløs', 'sømløst', 'banebrytende', 'lås opp', 'låse opp', 'låser opp', 'dykk ned', 'dykke ned', 'dykker ned',
  'neste nivå', 'i en verden hvor', 'i en verden der', 'det handler om', 'i dagens digitale', 'i dagens samfunn',
  'revolusjonerende', 'game changer', 'gamechanger', 'strømlinjeformet', 'fullt potensial', 'utnytte potensialet',
  'skreddersydde løsninger', 'helhetlige løsninger', 'en ny æra', 'gir gjenklang', 'reiser spørsmål', 'spennende reise',
  'heve opplevelsen', 'løft virksomheten',
];

// Fjerner det som ikke er brødtekst: frontmatter, kodeblokker, kode, lenker og HTML.
function rensLinjer(md) {
  const linjer = md.replace(/\r/g, '').split('\n');
  const ut = [];
  let iKode = false;
  let iFront = linjer[0] === '---';
  linjer.forEach((linje, i) => {
    if (iFront) {
      if (i > 0 && linje === '---') iFront = false;
      return;
    }
    if (/^\s*(```|~~~)/.test(linje)) {
      iKode = !iKode;
      return;
    }
    if (iKode) return;
    let s = linje
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\]\([^)]*\)/g, '] ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/<!--.*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, ' ')
      .replace(/\[Mangler:[^\]]*\]/gi, ' ');
    if (/^\s*\|?\s*:?-{2,}/.test(s)) return; // tabellskille
    s = s.replace(/\|\s*-\s*(?=\|)/g, '| x ').replace(/^\s*([-*+]|\d+\.)\s+/, '');
    ut.push({ nr: i + 1, tekst: s, overskrift: /^\s*#/.test(linje) });
  });
  return ut;
}

export function sjekkTekst(md) {
  const feil = [];
  const varsler = [];
  for (const { nr, tekst, overskrift } of rensLinjer(md)) {
    const lav = tekst.toLowerCase();
    if (/[—–]/.test(tekst)) feil.push(`linje ${nr}: tankestrek (— eller –). Bruk punktum eller komma.`);
    if (/\S\s-\s\S/.test(tekst)) feil.push(`linje ${nr}: bindestrek brukt som tankestrek (" - "). Skriv om med punktum eller komma.`);
    if (tekst.includes(';')) feil.push(`linje ${nr}: semikolon. Del opp i to setninger eller bruk komma.`);
    if (/!(?!\[)/.test(tekst)) feil.push(`linje ${nr}: utropstegn. Fjern det.`);
    for (const ord of AI_ORD) if (lav.includes(ord)) feil.push(`linje ${nr}: AI-aktig uttrykk "${ord}". Skriv det enklere.`);
    if (/ikke bare\b.*\bmen\b/.test(lav)) feil.push(`linje ${nr}: "ikke bare ... men" er et typisk AI-mønster. Si det rett ut.`);
    if (!overskrift && tekst.includes('?')) varsler.push(`linje ${nr}: spørsmålstegn i brødtekst. Lov i overskrifter, hooks og spørsmål kunder stiller, ellers skriv om.`);
  }
  return { feil, varsler };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fil = process.argv[2];
  if (!fil) {
    console.log('Bruk: node .claude/skills/bilder/scripts/sjekk-tekst.mjs <fil.md>');
    process.exit(1);
  }
  const { feil, varsler } = sjekkTekst(fs.readFileSync(fil, 'utf8'));
  if (varsler.length) console.log('VARSLER (vurder):\n' + varsler.slice(0, 40).join('\n'));
  if (feil.length) {
    console.log('FEIL (må rettes):\n' + feil.slice(0, 80).join('\n'));
    process.exit(1);
  }
  console.log('Teksten følger skrivereglene.');
}
