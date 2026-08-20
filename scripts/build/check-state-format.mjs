// @layer tooling-scripts @kind build
/**
 * Release gate for the save state format, and the writer of the asset that publishes it.
 *
 * The id itself is computed by the build (core/wasm-build/layout-probe.mjs) and needs no
 * human input, so there is nothing here to forget. This exists for the narrower job of
 * refusing to publish an id that nobody has written down: if the layout moved, the release
 * stops until a KNOWN_FORMATS row says what moved and why.
 *
 * The emitted asset carries the id IN ITS FILENAME — `state-format-<id>.json` — so an older
 * build can answer "will my save states still load?" from the release listing alone, with
 * no extra request per version.
 *
 * Usage:
 *   node scripts/build/check-state-format.mjs                  # gate only
 *   node scripts/build/check-state-format.mjs --emit <dir>     # gate, then write the asset
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const generatedPath = join(root, 'shared', 'game', 'save-state', 'current-format.generated.ts');
const formatsPath = join(root, 'shared', 'game', 'save-state', 'formats.ts');
const pkgPath = join(root, 'package.json');

/**
 * Both files are read as text rather than imported: this runs as plain node in a release
 * job with no TypeScript loader, and the shapes involved are two literals.
 */
const readGenerated = () => {
  if (!existsSync(generatedPath)) {
    fail('shared/game/save-state/current-format.generated.ts is missing. Run the wasm build (it runs the layout probe).');
  }
  const src = readFileSync(generatedPath, 'utf8');
  const id = src.match(/id:\s*'([0-9a-f]+)'/)?.[1];
  const totalBytes = Number(src.match(/totalBytes:\s*(\d+)/)?.[1]);
  if (!id || !Number.isFinite(totalBytes)) fail('Could not read the id/totalBytes out of the generated module.');
  return { id, totalBytes };
};

/** Deduped: BASELINE repeats the original id, and listing it twice reads like a bug. */
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
      + `Add a KNOWN_FORMATS row in shared/game/save-state/formats.ts saying what moved,\n`
      + `then release again. Publishing without one would leave every older build unable to\n`
      + `explain the break to the people it happens to.`,
    );
  }

  console.log(`[state-format] ok — ${id} (${totalBytes} bytes) is registered`);

  const emitIndex = process.argv.indexOf('--emit');
  if (emitIndex === -1) return;

  const dir = process.argv[emitIndex + 1];
  if (!dir) fail('--emit needs a directory');
  mkdirSync(dir, { recursive: true });

  const { version } = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const name = `state-format-${id}.json`;
  // The filename is what readers use; the body is for a human who opens it.
  writeFileSync(join(dir, name), `${JSON.stringify({ id, totalBytes, app: version }, null, 2)}\n`);
  console.log(`[state-format] wrote ${join(dir, name)}`);
};

run();
