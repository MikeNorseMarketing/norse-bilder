// Layoutene for innleggene. Hver layout er en HTML-mal som fylles med tekst og merkevare.
// Tekst kan markeres med **ord** for å få aksentfargen, og \n for linjeskift.

export const LAYOUTER = {
  hook: { navn: 'Stort spørsmål eller påstand', felt: ['overskrift'], valgfritt: ['etikett', 'undertekst', 'bilde', 'bildeFokus'], stil: 'farge' },
  tilbud: { navn: 'Tilbud', felt: ['overskrift', 'punkter', 'knapp'], valgfritt: ['etikett', 'pris', 'prisTekst', 'bilde', 'bildeFokus'], stil: 'mork' },
  sitat: { navn: 'Kundesitat eller kunderesultat', felt: ['sitat', 'navn'], valgfritt: ['rolle', 'resultat', 'resultatTekst', 'bilde', 'bildeFokus', 'etikett'], stil: 'lys' },
  tips: { navn: 'Tips og råd', felt: ['overskrift', 'punkter'], valgfritt: ['etikett'], stil: 'lys' },
  'for-etter': { navn: 'Før og etter', felt: ['for', 'etter'], valgfritt: ['overskrift', 'bildeFor', 'bildeEtter', 'etikettFor', 'etikettEtter'], stil: 'lys' },
  tall: { navn: 'Tall og fakta', felt: ['tall', 'forklaring', 'kilde'], valgfritt: ['etikett'], stil: 'farge' },
  myte: { navn: 'Myte og sannhet', felt: ['myte', 'fakta'], valgfritt: ['etikett', 'etikettMyte', 'etikettFakta'], stil: 'mork' },
  cta: { navn: 'Oppfordring', felt: ['overskrift', 'knapp'], valgfritt: ['etikett', 'undertekst', 'kontakt', 'bilde', 'bildeFokus'], stil: 'farge' },
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **ord** blir aksentfarge, \n blir linjeskift.
export const fmt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>').replace(/\\n|\n/g, '<br>');
export const ren = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/\\n|\n/g, ' ').trim();

const IKON = {
  hake: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  kryss: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  pil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ned: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v13M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sitat: '<svg viewBox="0 0 64 48" aria-hidden="true"><path fill="currentColor" d="M0 48V28C0 12 8 3 24 0l3 7C18 10 14 15 13 22h12v26H0zm37 0V28c0-16 8-25 24-28l3 7c-9 3-13 8-14 15h12v26H37z"/></svg>',
};

const etikett = (tekst, klasse = '') => (tekst ? `<div class="etikett ${klasse}">${fmt(tekst)}</div>` : '');
const fotoStil = (src, fokus) => `background-image:url('${src}');background-position:${esc(fokus || 'center')}`;

// Bygger innholdet i ett innlegg. Returnerer HTML for .innhold og ekstra klasser på rammen.
export function byggInnhold(p, bilder) {
  const b = (navn) => bilder[navn] || null;
  switch (p.layout) {
    case 'hook': {
      if (b('bilde')) {
        return {
          ramme: 'paa-foto',
          bak: `<div class="foto-bg" style="${fotoStil(b('bilde'), p.bildeFokus)}"></div><div class="foto-skygge"></div>`,
          html: `${etikett(p.etikett)}<div class="vokser"></div>
            <h1 class="overskrift hook-tekst" data-fit="56">${fmt(p.overskrift)}</h1>
            ${p.undertekst ? `<p class="undertekst" data-fit="28">${fmt(p.undertekst)}</p>` : ''}`,
        };
      }
      const sporsmal = ren(p.overskrift).endsWith('?');
      return {
        ramme: '',
        bak: sporsmal ? '<div class="dekor-sporsmal">?</div>' : '<div class="dekor-ring"></div>',
        html: `${etikett(p.etikett)}<div class="vokser"></div>
          <div class="aksent-strek"></div>
          <h1 class="overskrift hook-tekst" data-fit="56">${fmt(p.overskrift)}</h1>
          ${p.undertekst ? `<p class="undertekst" data-fit="28">${fmt(p.undertekst)}</p>` : ''}
          <div class="vokser"></div>`,
      };
    }
    case 'tilbud': {
      const punkter = (p.punkter || []).map((x) => `<li><span class="ikon">${IKON.hake}</span><span data-fit="24">${fmt(x)}</span></li>`).join('');
      const pris = p.pris ? `<div class="pris"><div class="pris-tall" data-fit="40">${fmt(p.pris)}</div>${p.prisTekst ? `<div class="pris-tekst">${fmt(p.prisTekst)}</div>` : ''}</div>` : '';
      return {
        ramme: b('bilde') ? 'med-foto-topp' : '',
        bak: b('bilde') ? '' : '<div class="dekor-hjorne"></div>',
        topp: b('bilde') ? `<div class="foto-topp" style="${fotoStil(b('bilde'), p.bildeFokus)}"></div>` : '',
        html: `${etikett(p.etikett)}
          <h2 class="overskrift tilbud-tekst" data-fit="44">${fmt(p.overskrift)}</h2>
          <ul class="sjekkliste">${punkter}</ul>
          <div class="vokser"></div>
          <div class="handling">${pris}<div class="knapp" data-fit="24">${fmt(p.knapp)}<span class="knapp-pil">${IKON.pil}</span></div></div>`,
      };
    }
    case 'sitat': {
      const resultat = p.resultat
        ? `<div class="resultat"><div class="resultat-tall" data-fit="60">${fmt(p.resultat)}</div>${p.resultatTekst ? `<div class="resultat-tekst" data-fit="22">${fmt(p.resultatTekst)}</div>` : ''}</div>`
        : '';
      const portrett = b('bilde') ? `<div class="portrett" style="${fotoStil(b('bilde'), p.bildeFokus)}"></div>` : '';
      return {
        ramme: '',
        bak: '',
        html: `${etikett(p.etikett)}${resultat}
          <div class="sitat-merke">${IKON.sitat}</div>
          <blockquote class="sitat-tekst" data-fit="30">${fmt(p.sitat)}</blockquote>
          <div class="vokser"></div>
          <div class="person">${portrett}<div><div class="navn">${fmt(p.navn)}</div>${p.rolle ? `<div class="rolle">${fmt(p.rolle)}</div>` : ''}</div></div>`,
      };
    }
    case 'tips': {
      const punkter = (p.punkter || [])
        .map((x, i) => `<li><span class="nr">${String(i + 1).padStart(2, '0')}</span><span class="tips-tekst" data-fit="24">${fmt(x)}</span></li>`)
        .join('');
      return {
        ramme: '',
        bak: '',
        html: `${etikett(p.etikett)}
          <h2 class="overskrift tips-overskrift" data-fit="40">${fmt(p.overskrift)}</h2>
          <ol class="nummerliste">${punkter}</ol>
          <div class="vokser"></div>`,
      };
    }
    case 'for-etter': {
      const panel = (klasse, merke, tekst, foto) => `
        <div class="panel ${klasse}${foto ? ' panel-foto' : ''}" data-boks="${klasse}">
          ${foto ? `<div class="foto-bg" style="background-image:url('${foto}')"></div><div class="foto-skygge"></div>` : ''}
          <div class="panel-merke">${fmt(merke)}</div>
          <p class="panel-tekst" data-fit="26">${fmt(tekst)}</p>
        </div>`;
      return {
        ramme: '',
        bak: '',
        html: `${p.overskrift ? `<h2 class="overskrift for-etter-overskrift" data-fit="38">${fmt(p.overskrift)}</h2>` : ''}
          <div class="paneler">
            ${panel('for', p.etikettFor || 'Før', p.for, b('bildeFor'))}
            <div class="panel-pil">${IKON.ned}</div>
            ${panel('etter', p.etikettEtter || 'Etter', p.etter, b('bildeEtter'))}
          </div>`,
      };
    }
    case 'tall':
      return {
        ramme: '',
        bak: '<div class="dekor-ring"></div>',
        html: `${etikett(p.etikett)}<div class="vokser"></div>
          <div class="stort-tall" data-fit="110">${fmt(p.tall)}</div>
          <p class="forklaring" data-fit="30">${fmt(p.forklaring)}</p>
          <div class="vokser"></div>
          <p class="kilde">${fmt(p.kilde)}</p>`,
      };
    case 'myte':
      return {
        ramme: '',
        bak: '',
        html: `${etikett(p.etikett)}
          <div class="vokser liten"></div>
          <div class="myte-blokk">
            <div class="myte-merke"><span class="ikon-rund feil">${IKON.kryss}</span>${fmt(p.etikettMyte || 'Myte')}</div>
            <p class="myte-tekst" data-fit="28">${fmt(p.myte)}</p>
          </div>
          <div class="skille"></div>
          <div class="myte-blokk">
            <div class="myte-merke"><span class="ikon-rund riktig">${IKON.hake}</span>${fmt(p.etikettFakta || 'Sannheten')}</div>
            <p class="fakta-tekst" data-fit="28">${fmt(p.fakta)}</p>
          </div>
          <div class="vokser"></div>`,
      };
    case 'cta': {
      const foto = b('bilde');
      return {
        ramme: foto ? 'med-foto-topp' : '',
        bak: foto ? '' : '<div class="dekor-ring stor"></div>',
        topp: foto ? `<div class="foto-topp" style="${fotoStil(foto, p.bildeFokus)}"></div>` : '',
        html: `${etikett(p.etikett)}<div class="vokser"></div>
          <h2 class="overskrift cta-tekst" data-fit="48">${fmt(p.overskrift)}</h2>
          ${p.undertekst ? `<p class="undertekst" data-fit="26">${fmt(p.undertekst)}</p>` : ''}
          <div class="knapp stor" data-fit="26">${fmt(p.knapp)}<span class="knapp-pil">${IKON.pil}</span></div>
          ${p.kontakt ? `<p class="kontakt">${fmt(p.kontakt)}</p>` : ''}
          <div class="vokser"></div>`,
      };
    }
    default:
      throw new Error(`Ukjent layout: ${p.layout}`);
  }
}

export function css(W, H) {
  const kvadrat = H <= W;
  return `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--bg); }
body { font-family: var(--f-t), system-ui, sans-serif; color: var(--tekst); -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }
.ramme { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: var(--bg); display: flex; flex-direction: column; padding: ${kvadrat ? 76 : 88}px ${kvadrat ? 76 : 88}px 0; }
.innhold { position: relative; z-index: 2; flex: 1 1 auto; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: ${kvadrat ? 26 : 34}px; }
.innhold > * { flex-shrink: 0; }
.innhold > .vokser { flex: 1 1 0; min-height: 0; gap: 0; }
.innhold > .vokser.liten { flex-grow: 0.4; }
.bunn { position: relative; z-index: 2; flex: 0 0 ${kvadrat ? 124 : 140}px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.logo { display: flex; align-items: center; }
.logo img { display: block; max-height: ${kvadrat ? 56 : 62}px; max-width: 300px; width: auto; height: auto; }
.logo.brikke { background: var(--brikke, #fff); padding: 14px 20px; border-radius: 16px; }
.ordmerke { font-family: var(--f-o); font-weight: var(--vekt-o); font-size: 34px; letter-spacing: -0.01em; }
.nettside { font-size: 26px; font-weight: 500; color: var(--dempet); letter-spacing: 0.01em; white-space: nowrap; }

.overskrift { font-family: var(--f-o); font-weight: var(--vekt-o); line-height: 1.04; letter-spacing: -0.02em; text-wrap: balance; overflow-wrap: normal; word-break: normal; hyphens: manual; }
.hl { color: var(--aksent); }
.hl-markor .hl { color: inherit; background: linear-gradient(transparent 60%, var(--markor) 60%, var(--markor) 94%, transparent 94%); padding: 0 0.06em; }
.undertekst { font-size: ${kvadrat ? 36 : 40}px; line-height: 1.3; color: var(--dempet); text-wrap: pretty; max-width: 860px; }
.etikett { align-self: flex-start; display: inline-flex; align-items: center; padding: 12px 24px; border-radius: 999px; background: var(--aksent); color: var(--paa-aksent); font-size: 25px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.etikett .hl { color: inherit; }

/* hook */
.hook-tekst { font-size: ${kvadrat ? 112 : 128}px; }
.aksent-strek { width: 120px; height: 14px; border-radius: 8px; background: var(--aksent); }
.dekor-sporsmal { position: absolute; z-index: 1; right: -90px; bottom: ${kvadrat ? -150 : -110}px; font-family: var(--f-o); font-weight: 800; font-size: ${kvadrat ? 760 : 880}px; line-height: 1; color: var(--aksent); opacity: 0.09; }
.dekor-ring { position: absolute; z-index: 1; width: 620px; height: 620px; right: -240px; top: -220px; border-radius: 50%; border: 70px solid var(--aksent); opacity: 0.14; }
.dekor-ring.stor { width: 760px; height: 760px; right: -300px; top: auto; bottom: -260px; }
.dekor-hjorne { position: absolute; z-index: 1; width: 420px; height: 420px; right: -170px; top: -170px; border-radius: 50%; background: var(--aksent); opacity: 0.16; }

/* bilder */
.foto-bg { position: absolute; inset: 0; background-size: cover; z-index: 0; }
.foto-skygge { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 28%, rgba(0,0,0,0.25) 52%, rgba(0,0,0,0.86) 100%); }
.ramme.paa-foto { --tekst: #ffffff; --dempet: rgba(255,255,255,0.88); color: #fff; }
.ramme.paa-foto .nettside { color: rgba(255,255,255,0.9); }
.foto-topp { position: relative; z-index: 2; flex: 0 0 ${kvadrat ? 34 : 38}%; margin: -${kvadrat ? 76 : 88}px -${kvadrat ? 76 : 88}px ${kvadrat ? 40 : 52}px; background-size: cover; }

/* tilbud */
.tilbud-tekst { font-size: ${kvadrat ? 76 : 88}px; }
.sjekkliste { list-style: none; display: flex; flex-direction: column; gap: ${kvadrat ? 18 : 24}px; }
.sjekkliste li { display: flex; align-items: flex-start; gap: 24px; font-size: ${kvadrat ? 34 : 38}px; line-height: 1.28; }
.sjekkliste li > span:last-child { flex: 1; min-width: 0; }
.ikon { flex: 0 0 auto; width: 50px; height: 50px; margin-top: -2px; border-radius: 50%; background: var(--aksent); color: var(--paa-aksent); display: inline-flex; align-items: center; justify-content: center; }
.ikon svg { width: 30px; height: 30px; }
.handling { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
.pris-tall { font-family: var(--f-o); font-weight: var(--vekt-o); font-size: 76px; line-height: 1; color: var(--aksent); white-space: nowrap; }
.pris-tekst { margin-top: 10px; font-size: 26px; color: var(--dempet); }
.knapp { display: inline-flex; align-items: center; gap: 18px; padding: 26px 40px; border-radius: 999px; background: var(--knapp-bg); color: var(--knapp-tekst); font-weight: 700; font-size: 34px; line-height: 1.1; white-space: nowrap; max-width: 100%; }
.knapp.stor { align-self: flex-start; padding: 32px 52px; font-size: 40px; }
.knapp-pil { display: inline-flex; width: 1.1em; height: 1.1em; }
.knapp-pil svg { width: 100%; height: 100%; }

/* sitat */
.sitat-merke { color: var(--aksent); width: 112px; }
.sitat-merke svg { width: 112px; height: 84px; display: block; }
.sitat-tekst { font-family: var(--f-o); font-weight: var(--vekt-sitat, 600); font-size: ${kvadrat ? 54 : 60}px; line-height: 1.22; letter-spacing: -0.01em; text-wrap: pretty; }
.resultat { align-self: flex-start; padding: 26px 34px; border-radius: 24px; background: var(--flate); }
.resultat-tall { font-family: var(--f-o); font-weight: var(--vekt-o); font-size: 92px; line-height: 1; color: var(--aksent); }
.resultat-tekst { margin-top: 8px; font-size: 28px; color: var(--dempet); max-width: 760px; }
.person { display: flex; align-items: center; gap: 26px; }
.portrett { width: 124px; height: 124px; border-radius: 50%; background-size: cover; flex: 0 0 auto; border: 5px solid var(--aksent); }
.navn { font-size: 36px; font-weight: 700; }
.rolle { font-size: 28px; color: var(--dempet); margin-top: 4px; }

/* tips */
.tips-overskrift { font-size: ${kvadrat ? 66 : 76}px; }
.nummerliste { list-style: none; display: flex; flex-direction: column; }
.nummerliste li { display: flex; align-items: baseline; gap: 30px; padding: ${kvadrat ? 20 : 26}px 0; border-top: 3px solid var(--linje); }
.nummerliste li:last-child { border-bottom: 3px solid var(--linje); }
.nr { font-family: var(--f-o); font-weight: var(--vekt-o); font-size: 52px; line-height: 1; color: var(--aksent); min-width: 78px; }
.tips-tekst { font-size: ${kvadrat ? 34 : 38}px; line-height: 1.3; flex: 1; min-width: 0; }

/* for-etter */
.for-etter-overskrift { font-size: ${kvadrat ? 58 : 66}px; }
.paneler { flex: 1 1 auto !important; min-height: 0; display: flex; flex-direction: ${kvadrat ? 'row' : 'column'}; gap: 22px; position: relative; }
.panel { position: relative; flex: 1 1 0; min-height: 0; min-width: 0; overflow: hidden; border-radius: 28px; padding: ${kvadrat ? 38 : 44}px; display: flex; flex-direction: column; gap: 18px; justify-content: center; }
.panel.for { background: var(--flate); color: var(--tekst); }
.panel.etter { background: var(--knapp-bg); color: var(--knapp-tekst); }
.panel-foto { color: #fff !important; justify-content: flex-end; }
.panel-foto .panel-merke, .panel-foto .panel-tekst { position: relative; z-index: 2; }
.panel-merke { align-self: flex-start; font-size: 24px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 20px; border-radius: 999px; background: rgba(127,127,127,0.18); }
.panel-tekst { font-size: ${kvadrat ? 40 : 46}px; line-height: 1.22; font-weight: 600; font-family: var(--f-o); text-wrap: pretty; }
.panel.etter .hl { color: inherit; text-decoration: underline; text-decoration-thickness: 4px; text-underline-offset: 6px; }
.panel-pil { position: absolute; z-index: 3; left: 50%; top: 50%; transform: translate(-50%, -50%)${kvadrat ? ' rotate(-90deg)' : ''}; width: 78px; height: 78px; border-radius: 50%; background: var(--bg); color: var(--tekst); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 8px var(--bg); }
.panel-pil svg { width: 40px; height: 40px; }

/* tall */
.stort-tall { font-family: var(--f-o); font-weight: var(--vekt-o); font-size: ${kvadrat ? 230 : 270}px; line-height: 0.95; letter-spacing: -0.04em; color: var(--aksent); white-space: nowrap; }
.forklaring { font-size: ${kvadrat ? 46 : 52}px; line-height: 1.22; font-weight: 600; font-family: var(--f-o); max-width: 900px; text-wrap: pretty; }
.kilde { font-size: 26px; color: var(--dempet); }

/* myte */
.myte-blokk { display: flex; flex-direction: column; gap: 18px; }
.myte-merke { display: flex; align-items: center; gap: 16px; font-size: 28px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dempet); }
.ikon-rund { width: 52px; height: 52px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
.ikon-rund svg { width: 30px; height: 30px; }
.ikon-rund.feil { background: var(--flate); color: var(--dempet); }
.ikon-rund.riktig { background: var(--aksent); color: var(--paa-aksent); }
.myte-tekst { font-size: ${kvadrat ? 46 : 52}px; line-height: 1.22; color: var(--dempet); font-family: var(--f-o); font-weight: 500; text-wrap: pretty; }
.fakta-tekst { font-size: ${kvadrat ? 52 : 60}px; line-height: 1.18; font-family: var(--f-o); font-weight: var(--vekt-o); letter-spacing: -0.01em; text-wrap: pretty; }
.skille { height: 3px; background: var(--linje); margin: 8px 0; }

/* cta */
.cta-tekst { font-size: ${kvadrat ? 96 : 108}px; }
.kontakt { font-size: 30px; color: var(--dempet); font-weight: 500; }
`;
}
