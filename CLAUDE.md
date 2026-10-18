# Norse Bilder

Denne mappa er et gratis verktøy som lager ferdige innlegg til Instagram og Facebook for norske småbedrifter. Brukeren skriver `/bilder`, og du lager designede bilder i bedriftens farger, fonter og logo, med bildetekster. Brukeren er ikke designer eller utvikler. Forklar med vanlige ord, og hold meldingene korte.

## Mappa

| Sti | Hva det er |
|---|---|
| `.claude/skills/bilder/SKILL.md` | Oppskriften for /bilder. Følg den steg for steg |
| `.claude/skills/bilder/references/` | Layoutene, tekstreglene, merkevaren og oppsettet |
| `.claude/skills/bilder/scripts/` | Små Node-skript som henter merkevaren fra nettsiden og tegner bildene |
| `bedrift/profil.md` | Hva bedriften selger, til hvem, tilbud og kunderesultater. `status: tom` betyr at den ikke er fylt ut |
| `bedrift/merkevare.md` | Farger, fonter og logo. `status: tom` betyr at den ikke er fylt ut |
| `bilder/inn/` | Brukerens egne bilder som kan brukes i innleggene |
| `output/bilder/` | Alt du lager, i en mappe per dato |

## Regler som alltid gjelder

1. Finn aldri på kunderesultater, sitater, tall, priser eller tilbud. Bruk bare det brukeren har sagt og det som står på nettsiden. Mangler noe, lag en annen type innlegg og si fra.
2. Ingen løfter om resultater.
3. Gjett aldri farger. De står i `bedrift/merkevare.md`, eller kommer fra nettsiden eller brukeren.
4. Skriv norsk bokmål, muntlig, med æ, ø og å. Ingen tankestrek som tegnsetting, ingen semikolon, ingen utropstegn. Spørsmålstegn bare i overskrifter og hooks. Hele lista står i `.claude/skills/bilder/references/skriveregler.md`.
5. Endre aldri filene i `bedrift/` uten å si fra.
6. Kjør skriptene med `node`, fra denne mappa. Ingen kommandoer som bare virker på Mac eller bare på Windows, med mindre du har en reserve for det andre.
7. Se på hvert bilde før du leverer det.
