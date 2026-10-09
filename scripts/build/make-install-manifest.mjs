/* @layer tooling-scripts @kind logic */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const STUB_VERSION = 1;

const REPO = 'https://github.com/drizztdourden08/relic-of-the-past';
const PREVIOUS_MANIFEST = `${REPO}/releases/latest/download/install.json`;

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const root = process.cwd();
const dir = arg('dir', join('release', 'win'));
const tag = arg('tag');
const base = arg('base');
if (!tag && !base) throw new Error('--tag is required, e.g. --tag v0.16.0');

const assetUrl = (name) => (base
  ? `${base.replace(/\/$/, '')}/${encodeURIComponent(name)}`
  : `${REPO}/releases/download/${tag}/${encodeURIComponent(name)}`);

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const entryFor = (name, extra = {}) => {
  const path = join(dir, name);
  if (!existsSync(path)) return null;
  return { url: assetUrl(name), sha256: sha256(path), ...extra };
};

const previousManifest = async () => {
  if (base) return null;
  try {
    const res = await fetch(PREVIOUS_MANIFEST);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};

const previous = await previousManifest();

const setup = entryFor('rotp-windows-payload.exe', { args: ['--silent'] }) ?? previous?.setup ?? null;
const portable = entryFor('rotp-windows-directory.zip') ?? previous?.portable ?? null;
const stub = entryFor('rotp-windows-setup.exe') ?? previous?.stub ?? null;

if (!setup) {
  throw new Error(
    'No setup in this release and no previous manifest to fall back on. '
    + 'The first release using the stub has to be a full one.',
  );
}

const appVersion = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')).version;
const manifest = { stubVersion: STUB_VERSION, version: appVersion, stub, setup, portable };
const out = join(dir, 'install.json');
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');

const source = (entry, name) => (base || entry?.url.includes(tag) ? 'this release' : `carried forward (${name})`);
console.log(`wrote ${out}`);
console.log(`  stubVersion ${STUB_VERSION}`);
console.log(`  setup    ${source(setup, 'setup')}`);
console.log(`  portable ${portable ? source(portable, 'portable') : 'none'}`);
console.log(`  stub     ${stub ? source(stub, 'stub') : 'none yet'}`);
