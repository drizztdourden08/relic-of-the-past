/* @layer tooling-scripts @kind logic */
/**
 * Writes install.json, the recipe the downloader stub reads before it installs
 * anything.
 *
 *   node scripts/build/make-install-manifest.mjs --dir release/win --tag v0.16.0
 *
 * The stub only ever knows one URL, `releases/latest/download/install.json`, so this
 * file has to answer every question it could have: which setup to fetch, how to run
 * it, what it should hash to, and whether the stub is even new enough to be reading
 * these instructions.
 *
 * URLs are absolute rather than bare asset names on purpose. Routine releases ship
 * only the update package, so the setup they point at usually lives on an EARLIER
 * release, and a name alone could not express that. When this release has no setup of
 * its own, the previous manifest's URLs are carried forward.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Raised only when a new stub gains an ability older ones lack. An older stub reading
 * a higher number fetches the newer stub and hands over to it.
 */
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
// Points the recipe somewhere other than the release page, which is how the whole
// download-and-install path gets exercised against a local server before anything
// is published: --base http://localhost:8000
const base = arg('base');
if (!tag && !base) throw new Error('--tag is required, e.g. --tag v0.16.0');

const assetUrl = (name) => (base
  ? `${base.replace(/\/$/, '')}/${encodeURIComponent(name)}`
  : `${REPO}/releases/download/${tag}/${encodeURIComponent(name)}`);

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

/** An entry for a file this release actually carries, or null when it does not. */
const entryFor = (name, extra = {}) => {
  const path = join(dir, name);
  if (!existsSync(path)) return null;
  return { url: assetUrl(name), sha256: sha256(path), ...extra };
};

/** What the last release said, so a routine release can keep pointing at a real setup. */
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

// rotp-windows-setup.exe is the stub: the small download the site links. The payload
// is what the stub then fetches and runs silently, and the zip is what it unzips for
// an install into a chosen directory. Neither of those two is offered as a download.
const setup = entryFor('rotp-windows-payload.exe', { args: ['--silent'] }) ?? previous?.setup ?? null;
const portable = entryFor('rotp-windows-directory.zip') ?? previous?.portable ?? null;
const stub = entryFor('rotp-windows-setup.exe') ?? previous?.stub ?? null;

if (!setup) {
  throw new Error(
    'No setup in this release and no previous manifest to fall back on. '
    + 'The first release using the stub has to be a full one.',
  );
}

// Stated rather than parsed out of a URL: a manifest pointed at a local server for
// testing has no release tag in its paths to read a version from.
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
