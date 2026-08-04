/* @layer tests @kind test */
/**
 * Every permanent e2e spec launches into ONE dedicated automation profile, isolated
 * from whatever profile the maintainer is actually playing on — no automated launch
 * may read or write the profile that opens by default (docs/contributing/testing.md,
 * "Mandatory: an automated launch always names its own profile").
 *
 * `provisionProfile` is the exact mechanism `npm run wt -- new <name>` already uses to
 * seed a worktree's instance profile: idempotent create-or-repair, and if the profile
 * doesn't exist yet, it is created from the seed — a copy of the maintainer's own named
 * manual saves (which the private vault restores into their profile), so
 * `--auto-state=test-jail-cell` and the other baselines work in it immediately. Reused
 * here rather than duplicated.
 *
 * That seed copies whichever manual saves the maintainer's OWN most-recently-played
 * profile happens to hold — real for the common baselines, but a fixture the vault
 * restored into `tests/fixtures/save-states/` and never got manually re-saved into a
 * live profile (the three cliff-ledge states, at the time this was written) is simply
 * absent there too, and `--auto-state=<name>` fails outright rather than skipping. So
 * on top of `provisionProfile`'s seed, this also restores directly from the checked-in
 * fixture folder — the one place every named baseline is guaranteed to exist — filling
 * in only what copying from a live profile missed.
 */
const TEST_INSTANCE = 'e2e-tests';

let provisioned: Promise<unknown> | null = null;

/**
 * Safe to call before every launch — only the first call in a process does any
 * work.
 *
 * The `.mjs` tooling module is loaded via a genuine dynamic `import()`, not a
 * static one. Playwright's own transform compiles this file to CJS, and a
 * static `import` of a real ESM module gets rewritten to a plain `require()`
 * at bundle time — which then runs the `.mjs` file's `export`/`import.meta`
 * syntax inside a CJS wrapper that has no `exports` binding
 * ("exports is not defined in ES module scope"). A dynamic `import()` is left
 * alone by the transform and resolved by Node's own loader at runtime, which
 * handles the interop correctly.
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
