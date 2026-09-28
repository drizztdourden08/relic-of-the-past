/* @layer root-config @kind logic */
/**
 * Runs the bundled API locally for the Sanctuary dev site, on the port its /api proxy
 * expects. `npm run sanctuary:api` from the repo root. Bundle it first (npm run bundle in
 * this folder); the deployed function never runs this file.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { portFor } from '../../shared/config/ports.constants.ts';
import { readPortSlot } from '../../shared/config/port-slot.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../..');

const frameworkBin = () => {
  const require = createRequire(join(HERE, 'package.json'));
  const manifestPath = require.resolve('@google-cloud/functions-framework/package.json');
  return join(dirname(manifestPath), require(manifestPath).bin['functions-framework']);
};

if (!existsSync(join(HERE, 'dist', 'index.js'))) {
  console.error('No dist/index.js. Run `npm run bundle` in cloud-functions/sanctuary-api first.');
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
