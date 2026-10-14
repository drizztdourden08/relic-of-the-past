/* @layer tooling-scripts @kind build */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const generatedPath = join(root, 'packages', 'game-core', 'src', 'save-state', 'current-format.constants.ts');
const formatsPath = join(root, 'packages', 'game-core', 'src', 'save-state', 'formats.ts');
const pkgPath = join(root, 'apps', 'desktop', 'package.json');

const readGenerated = () => {
  if (!existsSync(generatedPath)) {
    fail('packages/game-core/src/save-state/current-format.constants.ts is missing. Run the wasm build (it runs the layout probe).');
  }
  const src = readFileSync(generatedPath, 'utf8');
  const id = src.match(/id:\s*'([0-9a-f]+)'/)?.[1];
  const totalBytes = Number(src.match(/totalBytes:\s*(\d+)/)?.[1]);
  if (!id || !Number.isFinite(totalBytes)) fail('Could not read the id/totalBytes out of the generated module.');
  return { id, totalBytes };
};

const readKnownIds = () => [
  ...new Set([...readFileSync(formatsPath, 'utf8').matchAll(/id:\s*'([0-9a-f]+)'/g)].map((m) => m[1])),
];

const fail = (message) => {
  console.error(`\n[state-format] ${message}\n`);
  process.exit(1);
};

const run = () => {
  const { id, totalBytes } = readGenerated();
  const known = readKnownIds();

  if (!known.includes(id)) {
    fail(
      `The save state layout changed.\n\n`
      + `  computed id : ${id} (${totalBytes} bytes)\n`
      + `  registered  : ${known.join(', ') || '(none)'}\n\n`
      + `Add a KNOWN_FORMATS row in packages/game-core/src/save-state/formats.ts saying what moved,\n`
      + `then release again. Publishing without one would leave every older build unable to\n`
      + `explain the break to the people it happens to.`,
    );
  }

  console.log(`[state-format] ${id} (${totalBytes} bytes) is registered`);

  const emitIndex = process.argv.indexOf('--emit');
  if (emitIndex === -1) return;

  const dir = process.argv[emitIndex + 1];
  if (!dir) fail('--emit needs a directory');
  mkdirSync(dir, { recursive: true });

  const { version } = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const name = `state-format-${id}.json`;
  writeFileSync(join(dir, name), `${JSON.stringify({ id, totalBytes, app: version }, null, 2)}\n`);
  console.log(`[state-format] wrote ${join(dir, name)}`);
};

run();
