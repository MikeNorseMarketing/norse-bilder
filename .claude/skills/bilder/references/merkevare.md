# Merkevaren: farger, fonter og logo

Alt lagres i `bedrift/merkevare.md`. Skriptet `lag-bilder.mjs` leser feltene i toppen av fila (frontmatter), så de må stå akkurat slik.

```
---
status: utkast
oppdatert: ÅÅÅÅ-MM-DD
navn: Bedriftsnavn
nettside: dinbedrift.no
farge_primar: "#1f3d36"
farge_aksent: "#ff7a59"
farge_mork: "#14211e"
farge_lys: "#f6f3ec"
font_overskrift: Fraunces
font_tekst: Inter
vekt_overskrift: 700
logo: bedrift/logo.svg
logo_lys:
---
```

## Hva feltene betyr

| Felt | Hva | Brukes til |
|---|---|---|
| `farge_primar` | Hovedfargen, den folk kjenner igjen | Bakgrunn i de fargede innleggene |
| `farge_aksent` | Fargen som skal stikke seg ut | Knapper, etiketter, tall, markerte ord |
| `farge_mork` | Den mørkeste fargen (ofte nesten svart) | Tekst på lyse bilder, bakgrunn i de mørke |
| `farge_lys` | Den lyseste fargen (hvit eller off-white) | Bakgrunn i de lyse innleggene |
| `font_overskrift` | Font til store overskrifter | Navnet slik det står på fonts.google.com |
| `font_tekst` | Font til vanlig tekst | Samme |
| `vekt_overskrift` | Hvor fet overskriften er (400 til 900) | 700 passer de fleste |
| `logo` | Stien til logoen | Vises nede til venstre på alle bildene |
| `logo_lys` | Valgfri lys eller hvit versjon av logoen | Brukes på mørke bakgrunner og bilder |

Skriptet passer selv på kontrasten. Er aksentfargen for svak mot en bakgrunn, bytter det til en farge som er lesbar og sier fra. Er logoen for lik bakgrunnen, får den en liten lys eller mørk brikke bak seg.

## Fra nettsiden

Kjør `node .claude/skills/bilder/scripts/hent-merkevare.mjs <nettadresse>`. Skriptet lagrer et skjermbilde av toppen av siden i `bedrift/nettside-skjermbilde.png`, prøver å lagre logoen som `bedrift/logo.png` eller `.svg`, og skriver ut fargene og fontene den fant.

Slik velger du:
1. Se på skjermbildet med Read. Fargene i lista er sortert etter hvor mye de brukes, ikke etter hva som er merkefargen. Store flater med hvitt, svart og grått er sjelden merkefargen.
2. **Primær:** fargen som går igjen i toppen, i knapper eller i logoen. **Aksent:** knappefargen eller fargen som brukes til å fremheve. Det kan være samme farge som primær hvis bedriften bare har én farge.
3. **Mørk og lys:** ta tekstfargen og bakgrunnsfargen fra siden. Er de helt svart og hvit, er det greit.
4. **Fonter:** bruk det skriptet fant hvis fonten finnes på Google Fonts. Finnes den ikke, velg en lignende (se under) og skriv det i notatene i fila.
5. **Logo:** se på `bedrift/logo.*` med Read. Er den uskarp, beskåret, feil logo eller har en hvit boks rundt seg, be brukeren legge inn riktig logofil i `bedrift/` (helst PNG med gjennomsiktig bakgrunn, eller SVG). Er logoen hvit, sett den som `logo_lys` også, og be om en mørk versjon hvis de har en.
6. Vis brukeren valget i to til tre linjer, og lagre.

## Uten nettside

Spør:
1. Hvilke farger bruker dere? Hex-koder (#1f3d36) er best. «Mørk grønn og korall» går også, da foreslår du hex-koder og viser dem.
2. Har dere fonter? Ellers velger du to som passer stilen.
3. Legg logoen i mappa `bedrift/`. Har dere ingen logo, brukes bedriftsnavnet som tekst.

## Fonter som passer de fleste

| Stil | Overskrift | Tekst |
|---|---|---|
| Ren og moderne | Inter | Inter |
| Varm og vennlig | Nunito | Nunito Sans |
| Tydelig og sterk | Montserrat | Open Sans |
| Eksklusiv og rolig | Playfair Display | Lato |
| Varm med karakter | Fraunces | Inter |
| Teknisk og skarp | Space Grotesk | Inter |
| Lekende | Poppins | Poppins |

Fonter som ligner kjente betalte fonter: Helvetica og Arial ligner Inter. Futura ligner Jost. Gotham ligner Montserrat. Proxima Nova ligner Figtree. Avenir ligner Nunito Sans. Garamond ligner EB Garamond. Brandon Grotesque ligner Josefin Sans.

Har bedriften en egen fontfil, kan stien skrives rett inn: `font_overskrift: bedrift/fonter/Merkefont-Bold.woff2`.
