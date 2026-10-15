/* @layer tests @kind helper */
import { TEST_INSTANCE } from './ensure-test-profile.constants';
import { REPO_ROOT } from '../../repo-root';

type FixtureEntry = { id: string; name: string; timestamp: number };

const restoreFixtureSaves = async (): Promise<void> => {
  const { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { gameDataPath } = await import('@rotp/test-profile/paths');

  const fixturesDir = join(REPO_ROOT, 'tests', 'fixtures', 'save-states');
  const manifestPath = join(fixturesDir, 'manifest.json');
  if (!existsSync(manifestPath)) return;
  const fixtures = JSON.parse(readFileSync(manifestPath, 'utf8')) as FixtureEntry[];

  const savesDir = gameDataPath('profiles', TEST_INSTANCE, 'saves', 'normal');
  mkdirSync(savesDir, { recursive: true });
  const profileManifestPath = join(savesDir, 'manifest.json');
  const profileManifest = existsSync(profileManifestPath)
    ? JSON.parse(readFileSync(profileManifestPath, 'utf8')) as FixtureEntry[]
    : [];
  const known = new Set(profileManifest.map((m) => m.id));

  let added = false;
  for (const fx of fixtures) {
    if (known.has(fx.id)) continue;
    const sav = join(fixturesDir, `${fx.name}.sav`);
    const vaultFixtureMissing = !existsSync(sav);
    if (vaultFixtureMissing) continue;
    copyFileSync(sav, join(savesDir, `${fx.id}.sav`));
    const png = join(fixturesDir, `${fx.name}.png`);
    if (existsSync(png)) copyFileSync(png, join(savesDir, `${fx.id}.png`));
    profileManifest.push(fx);
    known.add(fx.id);
    added = true;
  }
  if (added) writeFileSync(profileManifestPath, `${JSON.stringify(profileManifest, null, 2)}\n`, 'utf8');
};

export { restoreFixtureSaves };
