#!/usr/bin/env node
/* @layer hub-core @kind logic */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { portSlotOf } from '@drizztdourden08/brock-thread/ports';
import { require as tsxRequire } from 'tsx/cjs/api';

const USAGE = 'rotp-serve-function <entry point> <port role>, run in an API folder, such as rotp-serve-function storeApi storeApi';

const [target, role] = process.argv.slice(2);
if (!target || !role) {
  console.error(USAGE);
  process.exit(1);
}

const apiDir = process.cwd();
const { portFor } = tsxRequire('@rotp/hub-contracts', import.meta.url);
const port = portFor(role, portSlotOf(apiDir));

if (!Number.isInteger(port)) {
  console.error(`No port role ${role} in packages/hub-contracts/src/ports/ports.constants.ts.`);
  process.exit(1);
}

if (!existsSync(join(apiDir, 'dist', 'index.js'))) {
  console.error(`No dist/index.js in ${apiDir}. Run pnpm run bundle there first.`);
  process.exit(1);
}

const frameworkBin = () => {
  const frameworkDir = join(apiDir, 'node_modules', '@google-cloud', 'functions-framework');
  const manifest = JSON.parse(readFileSync(join(frameworkDir, 'package.json'), 'utf8'));
  return join(frameworkDir, manifest.bin['functions-framework']);
};

console.log(`${target} on http://localhost:${port}`);
const child = spawn(process.execPath, [frameworkBin(), `--target=${target}`, '--source=dist', `--port=${port}`], { cwd: apiDir, stdio: 'inherit' });
child.on('close', (code) => process.exit(code ?? 0));
