/* @layer tooling-scripts @kind logic */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const RECORDS = join(ROOT, 'packages', 'game-data', 'src', 'data', 'records');
const DEFINITIONS = join(ROOT, 'packages', 'game-data', 'data', 'sprite-manifest', 'definitions.json');

const REQUIRED_ROOTS = ['actors', 'checks', 'connections', 'items', 'screens'];

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
    fail('the vault was never fetched, so there is no record dataset at packages/game-data/src/data/records');
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
