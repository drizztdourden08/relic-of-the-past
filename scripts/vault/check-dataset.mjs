/* @layer tooling-scripts @kind logic */
/**
 * Assert the private record dataset is present, for release builds only.
 *
 * Everything under `shared/game/data/records/` reaches the app through Vite
 * globs that resolve to an empty object when the folder is absent, and every
 * consumer falls back to an empty dataset. That fallback is CORRECT for a clone
 * without vault access: the app builds, lints and runs with nothing to show,
 * which is the same state as a user who has supplied no ROM.
 *
 * The cost is that "no dataset" and "the dataset failed to arrive" are the same
 * value, and a release build cannot tell them apart. It did not: v0.17.0 through
 * v0.18.0 shipped with an empty dataset and a green build, because CI had no way
 * to reach the vault and nothing said so. Sprite extraction reported success and
 * wrote zero files.
 *
 * So this runs in the release workflow ONLY, immediately after the vault is
 * fetched, and is the one place where an empty dataset is an error rather than a
 * normal state. It never runs on `npm run ci`, which must stay green without a
 * vault — that property is what proves the fallbacks still work.
 *
 *   node scripts/vault/check-dataset.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const RECORDS = join(ROOT, 'shared', 'game', 'data', 'records');
const DEFINITIONS = join(RECORDS, 'sprite-manifest', 'definitions.json');

/**
 * Roots whose absence has a visible effect in the app, so a partial fetch is
 * caught rather than passing on the strength of one file. Not the full list on
 * purpose: this is a smoke test for "the vault arrived", not a schema check.
 */
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
    fail('no record dataset at shared/game/data/records — the vault was never fetched');
    return;
  }

  const missing = REQUIRED_ROOTS.filter((root) => !existsSync(join(RECORDS, root)));
  if (missing.length > 0) {
    fail(`record dataset is incomplete — missing ${missing.join(', ')}`);
    return;
  }

  const sprites = countSprites();
  if (typeof sprites !== 'number') {
    fail(`sprite definitions ${sprites ?? 'are absent'} — extraction would silently do nothing`);
    return;
  }
  if (sprites === 0) {
    fail('sprite definitions list is empty — extraction would silently do nothing');
    return;
  }

  const roots = readdirSync(RECORDS).length;
  process.stdout.write(`dataset ok: ${sprites} sprite definitions, ${roots} record roots\n`);
};

main();
