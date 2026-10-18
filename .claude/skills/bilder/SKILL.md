---
name: bilder
description: Lager ferdige, designede innlegg til Instagram og Facebook i bedriftens egne farger, fonter og logo, med kort tekst i hvert bilde og en bildetekst til hvert innlegg. Bildene lages fra faste maler (tilbud, kunderesultat og sitat, tips, stort spørsmål, før og etter, tall, myte og sannhet, oppfordring) og lagres som PNG, uten betalt bildeverktøy. Bruk når brukeren skriver /bilder, ber om bilder, innlegg, poster eller grafikk til Instagram, Facebook eller sosiale medier, vil ha innhold for måneden, eller ber om bilder med fargene, fontene og logoen sin.
---

# /bilder

Du lager 8 ferdige innlegg til Instagram og Facebook (eller så mange brukeren ber om, 6 til 10). Brukeren er en norsk småbedriftseier, ikke en designer eller utvikler. Forklar med vanlige ord, og hold meldingene korte.

Du leverer:
- `output/bilder/ÅÅÅÅ-MM-DD/01.png`, `02.png` og så videre (1080x1350 som standard, 1080x1080 hvis brukeren vil)
- `tekster.md` med bildetekst til hvert innlegg
- `oversikt.html` med alle bildene og en kopier-knapp for hver bildetekst

## Før du starter

Les `references/skriveregler.md`. Reglene gjelder alt du skriver, både i bildene og i bildetekstene.

Kjør skriptene nøyaktig slik de står her, uten `| tail`, `2>&1` eller `&&` på slutten. Da kjenner Claude-appen dem igjen og brukeren slipper å godkjenne hver kommando. Vil du se innholdet i en fil, bruk Read, ikke `node -e` eller `cat`.

Si kort hva som skjer: «Jeg leser hva dere selger og hvordan merkevaren ser ut, skriver tekstene og lager bildene. Det tar rundt 5 til 10 minutter.»

## Steg 1. Sjekk verktøyene

Si først: «Jeg sjekker at verktøyet som lager bildene er på plass. Første gang installerer jeg Playwright i denne mappa. Det er et gratis verktøy som lar meg tegne bildene i en nettleser og lagre dem som PNG.»

```
node .claude/skills/bilder/scripts/oppsett.mjs
```
Slutter den med `KLAR`, gå videre. Finnes ikke `node`, eller slutter den med `IKKE KLAR`, følg `references/oppsett.md`.

## Steg 2. Bedriften

Les `bedrift/profil.md`. Har den `status: tom`, fyll den ut nå:
1. Har brukeren en nettside, les forsiden og de viktigste undersidene (tjenester, priser, om oss, kundehistorier) med nettlesing.
2. Still det du ikke fant svar på i én melding, nummerert, maks seks spørsmål:
   1. Hva selger dere, og hvem er den typiske kunden?
   2. Hvilket tilbud vil du løfte fram denne måneden? Skal prisen stå i bildet?
   3. Har du kunderesultater eller sitater vi kan bruke? Skriv dem ordrett, med navn og om navnet kan vises.
   4. Hva skal folk gjøre når de har sett innlegget? (ringe, booke, sende melding, gå til nettsiden) Hvilken adresse eller telefon?
   5. Hva spør kundene ofte om, eller hva tror de feil om?
   6. Har du bilder du vil bruke? Legg dem i mappa `bilder/inn/`.
3. Lagre profilen med `status: utkast` og dagens dato. Skriv `[Mangler: ...]` der du ikke vet. Gjett aldri.

Har brukeren allerede svart i meldingen, eller bedt deg kjøre uten spørsmål, ikke spør.

## Steg 3. Merkevaren

Les `bedrift/merkevare.md`. Har den `status: tom`, følg `references/merkevare.md`. Kort fortalt:
- Har bedriften nettside: kjør `node .claude/skills/bilder/scripts/hent-merkevare.mjs <nettadresse>`. Se på skjermbildet og logoen med Read før du velger farger og fonter.
- Ellers: spør om farger (hex-koder eller beskrivelse), fonter (eller «velg for meg») og logo (be dem legge fila i `bedrift/`).
- Vis valget kort og lagre fila med `status: utkast`.

## Steg 4. Planlegg innleggene

Følg `references/innlegg.md`. Standard for 8 innlegg:
- 2 om tilbudet (`tilbud` og `cta`)
- 2 med resultater fra kunder (`sitat` og `for-etter` eller `tall`), bare hvis brukeren har gitt deg ekte resultater
- 3 med konkrete råd til målgruppen (`tips`, `myte` og en `hook` som stiller et spørsmål de kjenner seg igjen i)
- 1 som vekker nysgjerrighet (`hook`)

Har brukeren ingen kunderesultater, bytter du de to plassene til råd eller nysgjerrighet. Si fra om det i svaret ditt, og forklar hva de kan sende deg for å få med resultater neste gang.

Ligger det bilder i `bilder/inn/`, se på hvert av dem med Read og bruk dem der de passer (se `references/innlegg.md`). Bruk aldri et bilde som viser noe annet enn det teksten sier.

## Steg 5. Skriv tekstene

- Tekst i bildet: kort. Holder grensene i `references/innlegg.md`. Ett budskap per bilde.
- Bildetekst: følg `references/tekster.md`.
- Bruk bare fakta fra profilen, nettsiden og det brukeren har sagt. Sitater ordrett. Ingen tall, priser eller resultater du ikke har fått.
- Gi hvert innlegg en vinkel (Smerte, Nysgjerrighet, Bevis, Råd, Forvandling, Motsatt, Tilbud). Ikke mer enn to innlegg med samme vinkel.

## Steg 6. Lag bildene

Lag mappa `output/bilder/ÅÅÅÅ-MM-DD/` (finnes den med bilder fra før, bruk `ÅÅÅÅ-MM-DD-2`). Skriv `innlegg.json` der, etter formatet i `references/innlegg.md`. Kjør:
```
node .claude/skills/bilder/scripts/lag-bilder.mjs output/bilder/<mappe>/innlegg.json
```
- Kode 0 og «Alt ser riktig ut»: gå videre.
- Kode 2: les «MÅ RETTES», rett `innlegg.json` (oftest kortere tekst) og kjør på nytt.
- Les også «MERKNADER». De stopper ikke, men si fra til brukeren hvis en farge måtte byttes for å bli lesbar.

## Steg 7. Se på hvert bilde

Åpne hvert PNG med Read. Sjekk:
- At all tekst er med, ingen ord er kuttet, og æ, ø og å ser riktige ut.
- At teksten er lett å lese mot bakgrunnen, også over bilder.
- At logoen sitter nede til venstre, er skarp, og ikke forsvinner mot bakgrunnen.
- At bunken varierer i farge og layout, og ikke ser ut som åtte like bilder.

Ser noe feil ut, rett og kjør skriptet på nytt. Lever aldri et bilde du ikke har sett på.

## Steg 8. Lever

Kjør skriptet en siste gang med `--apne` på slutten, så åpnes oversikten i nettleseren. Gi brukeren en kort melding:
- Hvor bildene, `tekster.md` og `oversikt.html` ligger.
- En linje per innlegg: nummer, type og hovedbudskap.
- Hva som manglet (for eksempel kunderesultater) og hva du gjorde i stedet.
- Et forslag til neste steg, for eksempel «Vil du ha en versjon i 1080x1080?» eller «Send meg et kundesitat, så lager jeg et innlegg til».

## Regler

1. Finn aldri på kunderesultater, sitater, tall, priser, tilbud eller rabatter. Bare det brukeren har gitt deg eller som står på nettsiden.
2. Ingen løfter om resultater («garantert», «doble omsetningen»).
3. Bruk bare merkevaren i `bedrift/merkevare.md`. Gjett aldri farger.
4. Endre aldri `bedrift/`-filene uten å si fra.
5. Følg `references/skriveregler.md` i alt du skriver.
