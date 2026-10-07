/* @layer tooling-scripts @kind logic */
/**
 * Assert the private record dataset is present, for release builds only. The Vite
 * globs under `shared/game/data/records/` resolve to empty when the folder is absent,
 * so "no dataset" and "the dataset failed to arrive" look the same: v0.17.0 through
 * v0.18.0 shipped empty with a green build. This runs in the release workflow only,
 * right after the vault fetch. Never on `npm run ci`, which must stay green without
 * a vault.
 *
 *   node scripts/vault/check-dataset.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const RECORDS = join(ROOT, 'shared', 'game', 'data', 'records');
const DEFINITIONS = join(RECORDS, 'sprite-manifest', 'definitions.json');

// Roots whose absence is visible in the app. Not the full list: a smoke test, not a schema check.
const REQUIRED_ROOTS = ['actors', 'checks', 'connections', 'items', 'screens', 'sprite-manifest'];

const fail = (message) => {
  process.stdout.write(`::error::${message}\n`);
  process.exitCode = 1;
};

const countSprites = () => {
  if (!existsSync(DEFINITIONS)) return null;
  try {
    return JSON.parse(readFileSync(DEFINITIONS, 'utf8')).sprites?.length ?? 0;
  } catch (error) {
    return `unreadable (${error.message})`;
  }
};

const main = () => {
  if (!existsSync(RECORDS)) {
    fail('the vault was never fetched, so there is no record dataset at shared/game/data/records');
    return;
  }

  const missing = REQUIRED_ROOTS.filter((root) => !existsSync(join(RECORDS, root)));
  if (missing.length > 0) {
    fail(`record dataset is missing ${missing.join(', ')}`);
    return;
  }

  const sprites = countSprites();
  if (typeof sprites !== 'number') {
    fail(`sprite definitions ${sprites ?? 'are absent'}, so extraction would silently do nothing`);
    return;
  }
  if (sprites === 0) {
    fail('sprite definitions list is empty, so extraction would silently do nothing');
    return;
  }

  const roots = readdirSync(RECORDS).length;
  process.stdout.write(`dataset ok: ${sprites} sprite definitions, ${roots} record roots\n`);
};

main();
