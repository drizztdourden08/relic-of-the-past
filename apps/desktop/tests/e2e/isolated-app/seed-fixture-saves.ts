/* @layer tests @kind helper */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FIXTURES } from './isolated-app.constants';

interface FixtureEntry {
  id: string;
  name: string;
  timestamp: number;
}

const readFixtureManifest = (): FixtureEntry[] => {
  const manifest = join(FIXTURES, 'manifest.json');
  return existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')) as FixtureEntry[] : [];
};

const seedFixtureSaves = (profileDir: string, only?: readonly string[]): number => {
  const wanted = readFixtureManifest()
    .filter((entry) => !only || only.includes(entry.name))
    .filter((entry) => existsSync(join(FIXTURES, `${entry.name}.sav`)));
  if (wanted.length === 0) return 0;
  const savesDir = join(profileDir, 'saves', 'normal');
  mkdirSync(savesDir, { recursive: true });
  for (const entry of wanted) {
    copyFileSync(join(FIXTURES, `${entry.name}.sav`), join(savesDir, `${entry.id}.sav`));
    const png = join(FIXTURES, `${entry.name}.png`);
    if (existsSync(png)) copyFileSync(png, join(savesDir, `${entry.id}.png`));
  }
  writeFileSync(join(savesDir, 'manifest.json'), `${JSON.stringify(wanted, null, 2)}\n`, 'utf8');
  return wanted.length;
};

export { seedFixtureSaves };
