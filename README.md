# Norse Bilder

Et gratis verktøy for Claude Code som lager ferdige innlegg til Instagram og Facebook for bedriften din. Bildene får dine farger, fonter og logo, og en kort tekst som passer til det du selger. Du får også en bildetekst til hvert innlegg.

Laget av Mikael Haugen i Norse Marketing. Følg på Instagram: [@mikael_haugen](https://www.instagram.com/mikael_haugen)

## Dette får du

- **8 ferdige bilder** i 1080x1350 (stående, det formatet som tar mest plass i feeden), eller 1080x1080 hvis du vil.
- **En god blanding:** tilbudet ditt, resultater fra kunder du har jobbet med, konkrete råd til kundene dine, og en tydelig oppfordring.
- **Dine farger, fonter og logo,** hentet fra nettsiden din eller fra det du forteller.
- **Bildetekster** klare til å lime inn, i `tekster.md`.
- **En oversiktsside** med alle bildene og en kopier-knapp for hver tekst.

Bildene tegnes fra ferdige maler på maskinen din. Ingen betalte bildeverktøy og ingen AI-genererte bilder.

## Dette trenger du

- Et betalt Claude-abonnement (Pro eller Max). Gratisversjonen har ikke Claude Code.
- Claude-appen på Mac eller Windows.
- Node.js, et gratis program som kjører små skript. Har du det ikke, hjelper Claude deg å installere det første gang.

## Slik kommer du i gang

**1. Last ned Claude-appen.** Gå til [claude.com/download](https://claude.com/download). På Mac åpner du fila og drar Claude til Programmer. På Windows kjører du installasjonsfila. Åpne Claude og logg inn.

**2. Last ned verktøyet.** Trykk på den grønne **Code**-knappen øverst på denne siden, og så **Download ZIP**. Pakk ut fila. Du får en mappe som heter `norse-bilder-main`. Legg den et sted du finner igjen, for eksempel på Skrivebordet.

**3. Legg inn logoen og bildene dine (valgfritt).** Logoen legger du i mappa `bedrift/`. Egne bilder du vil bruke, for eksempel av deg, kunder eller produktet, legger du i `bilder/inn/`. Har du nettside, kan Claude hente logoen derfra.

**4. Åpne mappa i Claude.** Klikk **Code** øverst i Claude-appen, velg **Local**, klikk **Select folder** og velg `norse-bilder-main`.

**5. Skriv kommandoen.** Skriv dette i meldingsfeltet og trykk Enter:

```text
/bilder
```

Du kan også skrive med egne ord, for eksempel «Lag 8 bilder til Instagram og Facebook for bedriften vår denne måneden. Bruk fargene, fontene og logoen vår.»

Første gang installerer Claude et lite, gratis verktøy i mappa, spør om nettsiden din og stiller noen korte spørsmål om tilbudet og kundene dine. Neste gang husker den alt, og du får nye bilder på noen minutter.

Tips: sett modusen ved siden av send-knappen til **Accept edits**, så slipper du å godkjenne hver fil.

### Foretrekker du terminalen?

Installer [Claude Code](https://code.claude.com/docs/en/setup) og Node.js 20 eller nyere. Så:

```bash
git clone https://github.com/MikeNorseMarketing/norse-bilder.git
cd norse-bilder
claude
```

Skriv `/bilder`.

## Slik er mappa bygget

```
norse-bilder/
├── CLAUDE.md                 Manualen Claude leser først
├── bedrift/profil.md         Hva du selger, til hvem, tilbud og kunderesultater
├── bedrift/merkevare.md      Farger, fonter og logo
├── bilder/inn/               Egne bilder du vil bruke
├── .claude/skills/bilder/    Oppskriften, malene og skriptene bak /bilder
└── output/bilder/            Bildene dine, en mappe per dato
```

## Ærlig om hva den gjør

- **Den finner ikke på resultater.** Kundesitater, tall og priser kommer bare fra deg eller nettsiden din. Har du ingen kunderesultater ennå, får du råd og spørsmål i stedet, og beskjed om hva du kan sende for å få dem med neste gang.
- **Den passer på at teksten er lesbar.** Teksten krympes hvis den er for lang, kontrasten sjekkes, og logoen får en liten brikke bak seg hvis den forsvinner mot bakgrunnen.
- **Den bruker faste maler.** Det gir rene, profesjonelle bilder hver gang, men ikke fotomontasjer eller illustrasjoner.
- **Fontene hentes fra Google Fonts.** Bruker du en betalt font, velger Claude en som ligner, eller du legger fontfila i `bedrift/`.

## Spørsmål

**Hva koster det?** Verktøyet er gratis. Du betaler for ditt eget Claude-abonnement.

**Hvor havner bildene mine?** Alt lagres i mappa på maskinen din, i `output/bilder/`.

**Kan jeg endre et bilde?** Ja. Skriv for eksempel «Gjør bilde 3 kortere» eller «Bytt fargen på bilde 5 til lys», så lager Claude det på nytt.

**Virker det på Windows?** Ja, Claude-appen virker likt på Mac og Windows.

**Noe virker ikke.** Ta et skjermbilde av feilen og lim det inn i Claude. Som regel forteller den deg hva som må fikses.

## Lisens

Gratis å bruke i din egen bedrift. Ikke for videresalg. Lisensiert under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/), se `LICENSE`.
