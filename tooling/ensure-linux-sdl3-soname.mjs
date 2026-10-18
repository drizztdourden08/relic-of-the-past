/* @layer tooling-scripts @kind logic */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

const virtualStore = resolve('node_modules/.pnpm');
const packageRoots = process.argv[2]
  ? []
  : [
    resolve('apps/desktop/node_modules/@drizztdourden08/brock-input'),
    resolve('node_modules/@drizztdourden08/brock-input'),
    ...readdirSync(virtualStore).filter((name) => name.startsWith('@drizztdourden08+brock-inpu'))
      .map((name) => resolve(virtualStore, name, 'node_modules/@drizztdourden08/brock-input')),
  ];
const installedRoots = [...new Set(packageRoots.filter(existsSync).map((path) => realpathSync(path)))];
if (!process.argv[2] && installedRoots.length === 0) throw new Error('Brock Input is missing from pnpm dependencies');

for (const packageRoot of installedRoots) {
  const prepare = resolve(packageRoot, 'bin/ensure-addon.mjs');
  const result = spawnSync(process.execPath, [prepare], { cwd: packageRoot, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Brock Input preparation failed in ${packageRoot}`);
}

const addonDirs = process.argv[2]
  ? [resolve(process.argv[2])]
  : installedRoots.map((path) => resolve(path, 'native/prebuilds/linux-x64'));

for (const addonDir of addonDirs) {
  if (!existsSync(addonDir)) throw new Error(`Linux SDL3 addon is missing from ${addonDir}`);
  const soname = resolve(addonDir, 'libSDL3.so.0');
  if (existsSync(soname)) continue;
  const versioned = readdirSync(addonDir).find((name) => /^libSDL3\.so\.0(?:\.\d+)+$/.test(name));
  if (!versioned) throw new Error(`SDL3 runtime is missing from ${addonDir}`);
  copyFileSync(resolve(addonDir, versioned), soname);
  console.log(`SDL3 runtime: ${versioned} copied to libSDL3.so.0 in ${addonDir}`);
}
console.log(`SDL3 runtime: checked ${addonDirs.length} addon location(s)`);
