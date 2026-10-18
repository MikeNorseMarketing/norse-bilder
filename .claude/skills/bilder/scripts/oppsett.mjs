// Sjekker at alt /bilder trenger er på plass, og installerer det som mangler.
// Kjør fra repo-mappen:  node .claude/skills/bilder/scripts/oppsett.mjs
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROT, startNettleser } from './felles.mjs';

function kjor(kommando, args) {
  // shell: true gjør at npm og npx virker både på Mac og Windows (npm.cmd).
  const r = spawnSync(kommando, args, { cwd: ROT, shell: true, encoding: 'utf8' });
  return { kode: r.status, ut: (r.stdout || '') + (r.stderr || '') };
}

function stopp(melding) {
  console.log('IKKE KLAR: ' + melding);
  process.exit(1);
}

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) stopp(`Node ${process.versions.node} er for gammel. Installer Node 20 eller nyere (LTS) fra nodejs.org.`);
console.log(`Node ${process.versions.node} er på plass.`);

const trengs = ['playwright'];
const mangler = trengs.filter((p) => !existsSync(path.join(ROT, 'node_modules', p, 'package.json')));
if (mangler.length) {
  console.log(`Installerer Playwright. Dette tar vanligvis under ett minutt.`);
  const r = kjor('npm', ['install', '--no-audit', '--no-fund']);
  if (r.kode !== 0) stopp('npm install feilet:\n' + r.ut.split('\n').slice(-15).join('\n'));
  console.log('Verktøyene er installert.');
} else {
  console.log('Verktøyene er allerede installert.');
}

async function provNettleser() {
  try {
    const { browser, navn } = await startNettleser();
    await browser.close();
    return navn;
  } catch (e) {
    if (e.code === 'INGEN_NETTLESER') return null;
    throw e;
  }
}

let nettleser = await provNettleser();
if (!nettleser) {
  console.log('Fant ingen nettleser verktøyet kan styre. Laster ned Chromium (rundt 150 MB, en gang).');
  const r = kjor('npx', ['playwright', 'install', 'chromium']);
  if (r.kode !== 0) stopp('Nedlasting av Chromium feilet:\n' + r.ut.split('\n').slice(-15).join('\n'));
  nettleser = await provNettleser();
  if (!nettleser) stopp('Chromium ble lastet ned, men starter ikke. Prøv å starte Claude-appen på nytt.');
}

const pwVersjon = JSON.parse(readFileSync(path.join(ROT, 'node_modules', 'playwright', 'package.json'), 'utf8')).version;
console.log(`KLAR: Node ${process.versions.node}, Playwright ${pwVersjon}, nettleser: ${nettleser}.`);
