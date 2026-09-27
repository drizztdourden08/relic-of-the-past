/* @layer tooling-scripts @kind build */
/**
 * Builds the Archipelago world package.
 *
 *   node scripts/build/build-apworld.mjs      (npm run build:apworld)
 *
 * 1. Runs the exporter (shared/randomizer/archipelago/export/export-world.ts) through Vite's
 *    SSR module runner, the way scripts/generate-from-records.mjs loads the dataset, and writes
 *    each JSON file into integrations/archipelago/relic_of_the_past/data/ (gitignored).
 * 2. Writes the package manifest, archipelago.json, stamped with AP_WORLD_VERSION.
 * 3. Zips the package folder to build/archipelago/relic_of_the_past.apworld, with the folder
 *    itself at the zip root as Archipelago requires.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { createServer } from 'vite';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PACKAGE_NAME = 'relic_of_the_past';
const PACKAGE_DIR = path.join(ROOT, 'integrations', 'archipelago', PACKAGE_NAME);
const DATA_DIR = path.join(PACKAGE_DIR, 'data');
const OUT_DIR = path.join(ROOT, 'build', 'archipelago');
const OUT_FILE = path.join(OUT_DIR, `${PACKAGE_NAME}.apworld`);
const MINIMUM_AP_VERSION = '0.6.4';
const SKIPPED = new Set(['__pycache__']);

const abs = (rel) => path.join(ROOT, rel);

/** The exporter's output and the package identity, loaded through Vite so the TS aliases resolve. */
const runExporter = async () => {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, watch: null },
    resolve: {
      alias: {
        '@shared': abs('shared'),
        '@app': abs('apps/web/src'),
        '@ds': abs('apps/web/src/ui/design-system'),
        '@domains': abs('apps/web/src/ui/domains'),
      },
    },
  });
  try {
    const { exportWorld } = await server.ssrLoadModule('/shared/randomizer/archipelago/export/export-world.ts');
    const { AP_GAME, AP_WORLD_VERSION } = await server.ssrLoadModule('/shared/randomizer/archipelago/ap-game.ts');
    return { files: exportWorld(), game: AP_GAME, version: AP_WORLD_VERSION };
  } finally {
    await server.close();
  }
};

const writeData = (files) => {
  mkdirSync(DATA_DIR, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(DATA_DIR, name), `${JSON.stringify(content)}\n`);
  }
};

const writeManifest = (game, version) => {
  const manifest = {
    game,
    world_version: version,
    minimum_ap_version: MINIMUM_AP_VERSION,
    authors: ['Relic of the Past'],
    version: 7,
    compatible_version: 7,
  };
  writeFileSync(path.join(PACKAGE_DIR, 'archipelago.json'), `${JSON.stringify(manifest, null, 2)}\n`);
};

/** Every file under the package folder, as paths relative to it, caches left out. */
const packageFiles = (dir, prefix = '') => readdirSync(dir).flatMap((name) => {
  if (SKIPPED.has(name)) return [];
  const full = path.join(dir, name);
  const rel = prefix === '' ? name : `${prefix}/${name}`;
  return statSync(full).isDirectory() ? packageFiles(full, rel) : [rel];
});

const zipPackage = async () => {
  const zip = new JSZip();
  for (const rel of packageFiles(PACKAGE_DIR)) {
    zip.file(`${PACKAGE_NAME}/${rel}`, readFileSync(path.join(PACKAGE_DIR, rel)));
  }
  const bytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, bytes);
  return bytes.length;
};

const main = async () => {
  const { files, game, version } = await runExporter();
  writeData(files);
  writeManifest(game, version);
  const size = await zipPackage();
  console.log(`build-apworld: ${path.relative(ROOT, OUT_FILE)} (${game} ${version}, ${Math.round(size / 1024)} KiB)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
