/* @layer root-config @kind logic */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { require as tsxRequire } from 'tsx/cjs/api';

const { portFor } = tsxRequire('@rotp/hub-contracts', import.meta.url);
const { readPortSlot } = tsxRequire('@rotp/hub-contracts/node', import.meta.url);

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../..');

const frameworkBin = () => {
  const require = createRequire(join(HERE, 'package.json'));
  const manifestPath = require.resolve('@google-cloud/functions-framework/package.json');
  return join(dirname(manifestPath), require(manifestPath).bin['functions-framework']);
};

if (!existsSync(join(HERE, 'dist', 'index.js'))) {
  console.error('No dist/index.js. Run `pnpm run bundle` in cloud-functions/sanctuary-api first.');
  process.exit(1);
}

const port = portFor('siteApi', readPortSlot(REPO_ROOT));
console.log(`Sanctuary API on http://localhost:${port}`);
const child = spawn(
  process.execPath,
  [frameworkBin(), '--target=sanctuaryApi', '--source=dist', `--port=${port}`],
  { cwd: HERE, stdio: 'inherit' },
);
child.on('close', (code) => process.exit(code ?? 0));
