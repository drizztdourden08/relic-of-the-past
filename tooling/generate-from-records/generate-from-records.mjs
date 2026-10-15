/* @layer tooling-scripts @kind build */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { buildEventBits } from './records-generator/event-bits.mjs';
import { cTableTargets } from './records-generator/c-tables.mjs';
import { taxonomyTargets } from './records-generator/taxonomies.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const RUN_HINT = 'pnpm run generate';
const EVENT_BITS_TARGET = 'packages/game-data/src/data/records/checks/events/event-bits.constants.ts';

const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => readFileSync(abs(rel), 'utf8');
const readIfPresent = (rel) => (existsSync(abs(rel)) ? read(rel) : null);

const loadDatasetAsTheAppSeedsIt = async () => {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, watch: null },
    resolve: {
      alias: {
        '@app': abs('apps/desktop/src'),
      },
    },
  });
  const data = await server.ssrLoadModule('/packages/game-data/src/data/index.ts');
  return { data, close: () => server.close() };
};

const targetsFor = (data) => [
  { path: EVENT_BITS_TARGET, content: buildEventBits(read) },
  ...taxonomyTargets(data),
  ...cTableTargets(data, read),
];

const settleTarget = (target, checkOnly) => {
  const label = target.label ?? target.path;
  const current = readIfPresent(target.path);
  if (current === target.content) { console.log(`up to date  ${label}`); return null; }
  if (checkOnly) { console.log(`STALE       ${label}`); return label; }
  writeFileSync(abs(target.path), target.content, 'utf8');
  console.log(`wrote       ${label}`);
  return null;
};

const run = async () => {
  const checkOnly = process.argv.includes('--check');
  const { data, close } = await loadDatasetAsTheAppSeedsIt();
  let targets;
  try {
    targets = targetsFor(data);
  } finally {
    await close();
  }

  const stale = targets.map((target) => settleTarget(target, checkOnly)).filter((label) => label !== null);

  if (checkOnly && stale.length > 0) {
    console.error(`\n${stale.length} generated target(s) differ from the records. Run \`${RUN_HINT}\`.`);
    process.exitCode = 1;
  }
};

await run();
