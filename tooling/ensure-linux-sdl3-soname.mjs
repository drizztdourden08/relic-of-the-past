/* @layer tooling-scripts @kind logic */
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const addonDir = resolve(process.argv[2] ?? 'apps/desktop/node_modules/@drizztdourden08/brock-input/native/prebuilds/linux-x64');
const soname = resolve(addonDir, 'libSDL3.so.0');

if (!existsSync(soname)) {
  if (!existsSync(addonDir)) throw new Error(`SDL3 addon directory is missing: ${addonDir}`);
  const versioned = readdirSync(addonDir).find((name) => /^libSDL3\.so\.0(?:\.\d+)+$/.test(name));
  if (!versioned) throw new Error(`SDL3 runtime is missing from ${addonDir}`);
  copyFileSync(resolve(addonDir, versioned), soname);
  console.log(`SDL3 runtime: ${versioned} copied to libSDL3.so.0`);
} else {
  console.log('SDL3 runtime: libSDL3.so.0 is present');
}
