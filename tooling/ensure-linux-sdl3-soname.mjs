/* @layer tooling-scripts @kind logic */
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const virtualStore = resolve('node_modules/.pnpm');
const candidates = process.argv[2]
  ? [resolve(process.argv[2])]
  : [
    resolve('apps/desktop/node_modules/@drizztdourden08/brock-input/native/prebuilds/linux-x64'),
    resolve('node_modules/@drizztdourden08/brock-input/native/prebuilds/linux-x64'),
    ...readdirSync(virtualStore).filter((name) => name.startsWith('@drizztdourden08+brock-inpu'))
      .map((name) => resolve(virtualStore, name, 'node_modules/@drizztdourden08/brock-input/native/prebuilds/linux-x64')),
  ];
const addonDirs = candidates.filter(existsSync);
if (addonDirs.length === 0) throw new Error('Linux SDL3 addon is missing from pnpm dependencies');

for (const addonDir of new Set(addonDirs)) {
  const soname = resolve(addonDir, 'libSDL3.so.0');
  if (existsSync(soname)) continue;
  const versioned = readdirSync(addonDir).find((name) => /^libSDL3\.so\.0(?:\.\d+)+$/.test(name));
  if (!versioned) throw new Error(`SDL3 runtime is missing from ${addonDir}`);
  copyFileSync(resolve(addonDir, versioned), soname);
  console.log(`SDL3 runtime: ${versioned} copied to libSDL3.so.0 in ${addonDir}`);
}
console.log(`SDL3 runtime: checked ${addonDirs.length} addon location(s)`);
