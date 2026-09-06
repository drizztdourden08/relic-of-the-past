/* @layer tooling-scripts @kind logic */
/**
 * Seeds a profile's named saves from `tests/fixtures/save-states/` so
 * `--auto-state=test-jail-cell` works on a fresh profile. Fixtures are name-keyed
 * (`test-jail-cell.sav`); the profile's `saves/normal/` store is id-keyed (`{id}.sav`,
 * see manifest-store.ts), so the job is that rename. Additive and idempotent: names
 * already in the manifest are skipped, never overwritten.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { locateVault, treeDirOf } from '../vault/locate.mjs';
import { gameDataPath } from './paths.mjs';

const FIXTURE_REL_PATH = ['tests', 'fixtures', 'save-states'];

const readJson = (path, fallback) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
};

/** The repo's own copy if `vault:sync` has run, else read straight from the vault checkout. */
const resolveFixtureDir = (repoRoot) => {
  const local = join(repoRoot, ...FIXTURE_REL_PATH);
  if (existsSync(join(local, 'manifest.json'))) return local;

  const vault = locateVault();
  if (!vault) return null;
  const fromVault = join(treeDirOf(vault), ...FIXTURE_REL_PATH);
  return existsSync(join(fromVault, 'manifest.json')) ? fromVault : null;
};

/**
 * Copy every fixture into `name`'s `saves/normal/`, skipping names already present.
 * Returns how many were added, or null when no fixture source exists (no vault access).
 */
const seedFixtureSaves = (repoRoot, name) => {
  const fixtureDir = resolveFixtureDir(repoRoot);
  if (!fixtureDir) return null;

  const fixtures = readJson(join(fixtureDir, 'manifest.json'), []);
  const destDir = gameDataPath('profiles', name, 'saves', 'normal');
  mkdirSync(destDir, { recursive: true });
  const destManifestPath = join(destDir, 'manifest.json');
  const destManifest = readJson(destManifestPath, []);
  const existingNames = new Set(destManifest.map((e) => e.name));

  let added = 0;
  for (const entry of fixtures) {
    if (existingNames.has(entry.name)) continue;
    const sav = join(fixtureDir, `${entry.name}.sav`);
    if (!existsSync(sav)) continue;
    cpSync(sav, join(destDir, `${entry.id}.sav`));
    const png = join(fixtureDir, `${entry.name}.png`);
    if (existsSync(png)) cpSync(png, join(destDir, `${entry.id}.png`));
    destManifest.push(entry);
    added++;
  }
  if (added > 0) writeFileSync(destManifestPath, `${JSON.stringify(destManifest, null, 2)}\n`, 'utf8');
  return added;
};

export { seedFixtureSaves };
