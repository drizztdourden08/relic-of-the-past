/* @layer tooling-scripts @kind logic */
/**
 * Guards against EXPORTED_FUNCTIONS drift between the two WASM builds.
 *
 * build.bat is the canonical build used for the app; the Makefile is what CI
 * (emmake make) ships. These two lists have silently diverged before, producing
 * release binaries missing functions the app ccalls at runtime. This script
 * extracts the exported-symbol set from each and fails on any mismatch.
 *
 * Usage: node scripts/build/check-wasm-exports.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const MAKEFILE = join(ROOT, 'core', 'wasm-build', 'Makefile');
const BUILD_BAT = join(ROOT, 'core', 'wasm-build', 'build.bat');

const extractExports = (path) => {
  const text = readFileSync(path, 'utf8');
  const match = text.match(/EXPORTED_FUNCTIONS\s*=\s*['"]?(\[[^\]]*\])/);
  if (!match) throw new Error(`Could not find EXPORTED_FUNCTIONS in ${path}`);
  const tokens = match[1].match(/_[A-Za-z0-9_]+/g) ?? [];
  return new Set(tokens);
};

const diff = (a, b) => [...a].filter((x) => !b.has(x)).sort();

const main = () => {
  const make = extractExports(MAKEFILE);
  const bat = extractExports(BUILD_BAT);

  const missingFromMakefile = diff(bat, make);
  const missingFromBuildBat = diff(make, bat);

  if (missingFromMakefile.length === 0 && missingFromBuildBat.length === 0) {
    console.log(`✓ WASM exports in sync (${make.size} functions).`);
    return;
  }

  console.error('✗ WASM EXPORTED_FUNCTIONS drift detected:');
  if (missingFromMakefile.length) {
    console.error(`  In build.bat but NOT Makefile (CI would ship a broken binary):`);
    missingFromMakefile.forEach((f) => console.error(`    - ${f}`));
  }
  if (missingFromBuildBat.length) {
    console.error(`  In Makefile but NOT build.bat:`);
    missingFromBuildBat.forEach((f) => console.error(`    - ${f}`));
  }
  console.error('\nSync the two EXPORTED_FUNCTIONS lists, then re-run.');
  process.exit(1);
};

main();
