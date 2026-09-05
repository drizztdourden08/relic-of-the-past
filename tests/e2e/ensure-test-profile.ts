/* @layer tests @kind test */
/**
 * Every permanent e2e spec launches into ONE dedicated automation profile. No
 * automated launch may touch the profile that opens by default
 * (docs/contributing/testing.md, "Mandatory: an automated launch always names
 * its own profile").
 *
 * `provisionProfile` is what `npm run wt -- new <name>` uses: idempotent
 * create-or-repair, seeded from the maintainer's own named manual saves. That
 * seed only holds what the maintainer's live profile holds, so a fixture the
 * vault restored into `tests/fixtures/save-states/` but never re-saved (the
 * three cliff-ledge states) would be missing and `--auto-state=<name>` would
 * fail. This also restores directly from the checked-in fixture folder.
 */
const TEST_INSTANCE = 'e2e-tests';

let provisioned: Promise<unknown> | null = null;

/**
 * Safe to call before every launch; only the first call in a process does work.
 *
 * The `.mjs` module is loaded via a dynamic `import()`: Playwright compiles this
 * file to CJS and rewrites a static import to `require()`, which breaks on the
 * `.mjs` file's `import.meta` ("exports is not defined in ES module scope").
 */
const ensureTestProfile = (): Promise<unknown> => {
  provisioned ??= (async () => {
    // @ts-expect-error -- plain .mjs tooling module, no type declarations by design
    const { provisionProfile } = await import('../../scripts/parallel/provision-profile.mjs');
    const result = await provisionProfile({ name: TEST_INSTANCE });
    await restoreFixtureSaves();
    return result;
  })();
  return provisioned;
};

/** Copy every checked-in save-state fixture into the test profile's manual
 *  saves, skipping any id already present (never overwrites a real run's state). */
const restoreFixtureSaves = async (): Promise<void> => {
  const { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  // @ts-expect-error -- plain .mjs tooling module, no type declarations by design
  const { gameDataPath } = await import('../../scripts/parallel/paths.mjs');

  const fixturesDir = join(__dirname, '..', 'fixtures', 'save-states');
  const manifestPath = join(fixturesDir, 'manifest.json');
  if (!existsSync(manifestPath)) return;
  const fixtures = JSON.parse(readFileSync(manifestPath, 'utf8')) as Array<{ id: string; name: string; timestamp: number }>;

  const savesDir = gameDataPath('profiles', TEST_INSTANCE, 'saves', 'normal');
  mkdirSync(savesDir, { recursive: true });
  const profileManifestPath = join(savesDir, 'manifest.json');
  const profileManifest = existsSync(profileManifestPath)
    ? JSON.parse(readFileSync(profileManifestPath, 'utf8')) as Array<{ id: string; name: string; timestamp: number }>
    : [];
  const known = new Set(profileManifest.map((m) => m.id));

  let added = false;
  for (const fx of fixtures) {
    if (known.has(fx.id)) continue;
    const sav = join(fixturesDir, `${fx.name}.sav`);
    if (!existsSync(sav)) continue; // private-vault fixture not present on this machine
    copyFileSync(sav, join(savesDir, `${fx.id}.sav`));
    const png = join(fixturesDir, `${fx.name}.png`);
    if (existsSync(png)) copyFileSync(png, join(savesDir, `${fx.id}.png`));
    profileManifest.push(fx);
    known.add(fx.id);
    added = true;
  }
  if (added) writeFileSync(profileManifestPath, `${JSON.stringify(profileManifest, null, 2)}\n`, 'utf8');
};

export { TEST_INSTANCE, ensureTestProfile };
