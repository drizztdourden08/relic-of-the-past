/* @layer electron-main @kind logic */
/**
 * A pack a profile selects is never left dangling. Each kind lives in one field: a music pack
 * in the profile's `msuPack`, a language set in its `language`, a character in its config's
 * `linkSprite`. Every profile is checked, since the library is global. An update points the
 * selection at the new copy; an uninstall passes null, which is each field's default.
 */
import type { FileStore } from '@shared/platform';
import { listProfiles, readConfig, updateProfile, writeConfig } from '@shared/storage/profiles';
import type { InstalledPack } from '@shared/store/installed-types';
import type { Profile } from '@shared/types/profile';

type SelectedPack = Pick<InstalledPack, 'kind' | 'installedName'>;

const repointOne = async (
  files: FileStore, profile: Profile, pack: SelectedPack, replacement: string | null,
): Promise<boolean> => {
  const { kind, installedName } = pack;
  if (kind === 'music') {
    if (profile.msuPack !== installedName) return false;
    await updateProfile(files, profile.id, { msuPack: replacement });
    return true;
  }
  if (kind === 'language') {
    if (profile.language !== installedName) return false;
    await updateProfile(files, profile.id, { language: replacement });
    return true;
  }
  const config = await readConfig(files, profile.id);
  if (!config || config.linkSprite !== installedName) return false;
  await writeConfig(files, profile.id, { ...config, linkSprite: replacement });
  return true;
};

/** The ids of the profiles that changed. */
const repointProfiles = async (
  files: FileStore, pack: SelectedPack, replacement: string | null,
): Promise<string[]> => {
  const changed: string[] = [];
  for (const profile of await listProfiles(files)) {
    if (await repointOne(files, profile, pack, replacement)) changed.push(profile.id);
  }
  return changed;
};

export { repointProfiles };
export type { SelectedPack };
