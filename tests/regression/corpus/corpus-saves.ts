/* @layer test @kind helper */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './corpus.constants';
import { savesIn } from './saves-in';
import type { SaveEntry } from './corpus.type';

const corpusSaves = (): SaveEntry[] => {
  const profiles = resolve(ROOT, '.user-data/Data/profiles');
  const perProfile = (existsSync(profiles) ? readdirSync(profiles) : []).flatMap((profile) => [
    ...savesIn('quick', resolve(profiles, profile, 'saves/quick')),
    ...savesIn('manual', resolve(profiles, profile, 'saves/normal')),
  ]);
  return [...perProfile, ...savesIn('fixture', resolve(ROOT, 'tests/fixtures/save-states'))];
};

export { corpusSaves };
