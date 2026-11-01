/* @layer renderer-app @kind logic */
import { listProfiles } from '@app/storage/profile-store';

type LaunchMode = 'online' | 'archipelia';

type LaunchProfilePick =
  | { kind: 'use'; profile: Profile }
  | { kind: 'create'; name: string }
  | { kind: 'refuse'; why: string };

const MODE_WORDS: Record<LaunchMode, string> = { online: 'an Archipelago (online)', archipelia: 'an Archipelia' };

const isMode = (profile: Profile, mode: LaunchMode): boolean => profile.randomizer?.mode === mode;

/**
 * Chooses the profile a connection flag runs against. A name from --profile-name is exact: that profile
 * is used when it exists and fits, created when it does not. Without a name the active profile is used
 * when it already fits, then a profile called `fallbackName`, and otherwise one is created under it.
 */
const pickLaunchProfile = async (
  active: Profile, mode: LaunchMode, explicitName: string | null, fallbackName: string,
): Promise<LaunchProfilePick> => {
  const profiles = await listProfiles();
  if (explicitName === null && isMode(active, mode)) return { kind: 'use', profile: active };
  const name = explicitName ?? fallbackName;
  const found = profiles.find((profile) => profile.name === name);
  if (found === undefined) return { kind: 'create', name };
  if (isMode(found, mode)) return { kind: 'use', profile: found };
  return { kind: 'refuse', why: `profile "${name}" exists but is not ${MODE_WORDS[mode]} profile` };
};

export { pickLaunchProfile };
export type { LaunchMode, LaunchProfilePick };
