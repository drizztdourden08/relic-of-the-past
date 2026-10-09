/* @layer electron-main @kind logic */
import type { DebugZipEntry } from '@drizztdourden08/brock-electron/main';
import type { FileStore } from '@shared/platform';

const parsed = (text: string | null): unknown => {
  if (text === null) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const randomizerOf = (profile: unknown): unknown =>
  (profile && typeof profile === 'object' && 'randomizer' in profile ? profile.randomizer : null) ?? null;

const pretty = (value: unknown): string => JSON.stringify(value, null, 2);

const collectProfileFiles = async (files: FileStore, profileId: string): Promise<DebugZipEntry[]> => {
  const dir = `profiles/${profileId}`;
  const [settings, profile, inputProfiles] = await Promise.all([
    files.readText(`${dir}/config.json`),
    files.readText(`${dir}/profile.json`),
    files.readText(`${dir}/input-profiles.json`),
  ]);
  const profileJson = parsed(profile);
  return [
    { name: 'settings.json', data: pretty(parsed(settings) ?? {}) },
    { name: 'profile.json', data: pretty(profileJson) },
    { name: 'randomizer.json', data: pretty(randomizerOf(profileJson)) },
    { name: 'input-profiles.json', data: pretty(parsed(inputProfiles)) },
  ];
};

export { collectProfileFiles };
