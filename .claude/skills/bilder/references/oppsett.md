# Oppsett og feilsøking

Skillen trenger Node.js (gratis) og verktøyet Playwright, som installeres i denne mappa og tegner bildene i en nettleser. `oppsett.mjs` sjekker og installerer Playwright selv. Node må være på maskinen fra før.

Forklar alltid brukeren hva du skal gjøre før du gjør det, med vanlige ord. Ingenting installeres utenfor denne mappa, bortsett fra Node og eventuelt nettleseren Chromium.

## Node mangler

Du ser det på at `node --version` gir en feil som «command not found», «ikke gjenkjent» eller lignende.

Si til brukeren: «Verktøyet trenger Node.js, et gratis program som kjører små skript. Jeg kan hjelpe deg å installere det. Det tar et par minutter.» Spør om det er greit før du starter.

### Mac

1. Sjekk om Homebrew finnes: `brew --version`. Finnes det, kjør `brew install node`.
2. Uten Homebrew: finn siste LTS-versjon i `https://nodejs.org/dist/index.json` (første oppføring der `lts` ikke er `false`). Last ned installasjonsfila til Nedlastinger:
   `curl -L -o ~/Downloads/node-installer.pkg https://nodejs.org/dist/v<versjon>/node-v<versjon>.pkg`
   Åpne den med `open ~/Downloads/node-installer.pkg`. Brukeren klikker seg gjennom og skriver inn Mac-passordet sitt.

### Windows

1. Prøv `winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements`.
2. Virker ikke winget: finn versjonen som over, last ned `https://nodejs.org/dist/v<versjon>/node-v<versjon>-x64.msi` (eller `-arm64.msi` på ARM-maskiner) med `curl.exe -L -o "%USERPROFILE%\Downloads\node-installer.msi" <adresse>` og åpne den med `start "" "%USERPROFILE%\Downloads\node-installer.msi"`. I PowerShell bruker du `$env:USERPROFILE` i stedet for `%USERPROFILE%`.

### Etter installasjonen

Be brukeren lukke Claude-appen helt og åpne den igjen, så den finner Node. Kjør så `/bilder` på nytt.

Reserve hvis ingenting virker: be brukeren gå til nodejs.org, laste ned LTS-versjonen og installere den som et vanlig program.

## oppsett.mjs sier IKKE KLAR

- **npm install feilet:** ofte nettverk eller brannmur. Prøv én gang til. Står det EACCES eller «permission denied», ligger mappa et sted brukeren ikke har skrivetilgang. Be dem flytte mappa til Skrivebordet eller Dokumenter.
- **Nedlasting av Chromium feilet:** skriptet prøver Chrome og Edge som allerede finnes på maskinen først. Har brukeren verken Chrome eller Edge og nedlastingen feiler, be dem installere Google Chrome og prøv igjen.
- **Mappa ligger i iCloud, OneDrive eller Dropbox:** det kan gjøre installasjonen treg eller rotete. Anbefal en vanlig mappe på maskinen.

## Når et skript feiler

- `hent-merkevare.mjs` får ikke åpnet siden: sjekk adressen, prøv med og uten www. Spør heller brukeren om farger, fonter og logo.
- `lag-bilder.mjs` melder at en font ikke finnes: fonten er ikke på Google Fonts. Velg en lignende fra fonts.google.com, eller be brukeren legge fontfila (.woff2, .ttf eller .otf) i `bedrift/` og skriv stien i `merkevare.md`.
- Bilder fra iPhone (HEIC) støttes ikke. Be brukeren eksportere dem som JPG, eller ta skjermbilde.
- Uten internett lastes ikke fontene fra Google. Da stopper skriptet med en melding om fonten.
