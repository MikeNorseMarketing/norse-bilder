# Innleggene: layouter, tekstgrenser og innlegg.json

## Formatet på innlegg.json

```json
{
  "format": "1080x1350",
  "innlegg": [
    {
      "layout": "hook",
      "stil": "farge",
      "vinkel": "Smerte",
      "etikett": "For deg med eget firma",
      "overskrift": "Gruer du deg til **MVA-fristen**?",
      "undertekst": "Tre ting som gjør den neste mye lettere",
      "bildetekst": "Første linje er hooken.\n\nSå to til fire korte avsnitt.\n\nSå hva de skal gjøre nå.",
      "alt": "Beskrivelse av bildet for svaksynte"
    }
  ]
}
```

- `format`: `"1080x1350"` (standard, stående format for feeden på Instagram og Facebook) eller `"1080x1080"` (kvadrat, også for feeden). Stories og reels er 1080x1920, og det formatet lager ikke verktøyet.
- `stil`: `"lys"`, `"mork"` eller `"farge"` (hovedfargen som bakgrunn). Utelater du den, bruker layouten sin standard.
- `**ord**` gir ordet aksentfargen. Bruk det på ett til tre ord per bilde, aldri mer.
- `\n` i en overskrift tvinger linjeskift. Bruk det sjelden, skriptet balanserer linjene selv.
- `bildetekst` er teksten som limes inn under innlegget. `\n\n` gir nytt avsnitt.
- `alt` er valgfri. Uten den lages alt-teksten av teksten i bildet.
- Rekkefølgen i lista blir 01, 02, 03 og så videre.

## Layoutene

Grensene er for at teksten skal være lett å lese på mobil. Skriptet krymper teksten litt hvis den er for lang, og melder fra hvis den ikke får plass.

| Layout | Til | Felt (påkrevd i fet) | Grenser | Standard stil |
|---|---|---|---|---|
| `hook` | Stort spørsmål eller påstand som stopper scrollingen | **overskrift**, etikett, undertekst, bilde | Overskrift maks 8 ord. Undertekst maks 12 ord | farge |
| `tilbud` | Tilbudet, med det som er inkludert | **overskrift**, **punkter**, **knapp**, etikett, pris, prisTekst, bilde | Overskrift maks 8 ord. 2 til 4 punkter, maks 8 ord hver. Knapp maks 4 ord | mork |
| `sitat` | Kundesitat, gjerne med et resultat | **sitat**, **navn**, rolle, resultat, resultatTekst, bilde (portrett), etikett | Sitat maks 30 ord, ordrett. Resultat kort, for eksempel «6 timer» | lys |
| `tips` | Konkrete råd | **overskrift**, **punkter**, etikett | Overskrift maks 9 ord. 3 til 5 punkter, maks 10 ord hver | lys |
| `for-etter` | Før og etter for en kunde, eller hverdagen før og etter tjenesten | **for**, **etter**, overskrift, bildeFor, bildeEtter, etikettFor, etikettEtter | Maks 15 ord per side | lys |
| `tall` | Ett sterkt tall med forklaring | **tall**, **forklaring**, **kilde**, etikett | Tall maks 7 tegn. Forklaring maks 15 ord. Kilde alltid med | farge |
| `myte` | Noe kundene tror som ikke stemmer | **myte**, **fakta**, etikett, etikettMyte, etikettFakta | Myte maks 14 ord. Sannheten maks 18 ord | mork |
| `cta` | Hva de skal gjøre nå | **overskrift**, **knapp**, undertekst, kontakt, etikett, bilde | Overskrift maks 8 ord. Knapp maks 4 ord. Kontakt er nettside eller telefon | farge |

`punkter` er en liste: `["Første", "Andre", "Tredje"]`.

## Ekte data, aldri oppdiktet

- `sitat`: bare ordrett fra brukeren eller nettsiden. Navn bare hvis brukeren har sagt at det kan vises. Ellers fornavn og bransje, eller dropp sitatet.
- `resultat`, `tall` og `for-etter` om en kunde: bare tall og historier brukeren har gitt deg. Skriv kilden i `kilde` (for eksempel «Tall fra en kunde, 2025» eller «Kilde: SSB 2024»).
- `pris`: bare hvis brukeren har sagt at prisen skal stå i bildet.
- `for-etter` kan også handle om hverdagen før og etter tjenesten generelt, uten tall. Da er det et råd, ikke et resultat.

## Variasjon i bunken

- Ikke samme layout to ganger på rad, og ikke samme stil to ganger på rad.
- Bland lys, mørk og farge omtrent likt.
- Minst 5 ulike layouter i en bunke på 8.
- God rekkefølge for 8: hook, tips, sitat, tilbud, myte, for-etter eller tall, hook, cta.

## Brukerens egne bilder

Bildene ligger i `bilder/inn/`. Se på hvert bilde med Read før du bruker det.

| Bildet viser | Bruk det i |
|---|---|
| Stemningsbilde, arbeidsplass, produkt i bruk | `hook` med `bilde` (hele bakgrunnen, teksten legges nederst over en mørk skygge) |
| Produktet eller tjenesten | `tilbud` eller `cta` med `bilde` (bildet øverst) |
| Kunden (portrett) | `sitat` med `bilde` (rundt portrett ved navnet) |
| Før og etter (to bilder) | `for-etter` med `bildeFor` og `bildeEtter` |

- Stien skrives fra repo-mappa: `"bilde": "bilder/inn/verksted.jpg"`.
- `bildeFokus` styrer hva som beholdes når bildet beskjæres, for eksempel `"center top"` for portretter.
- Bruk hvert bilde bare én gang per bunke.
- Bilder av personer: bare hvis brukeren har bekreftet at de kan brukes.
- Ingen bilder i mappa: alle layoutene ser ferdige ut uten.
