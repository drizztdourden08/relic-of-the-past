/* @layer renderer-app @kind logic */
import { listProfiles } from '@app/storage/profile-store';
import { MODE_WORDS } from './launch-connect.constants';
import type { LaunchMode, LaunchProfilePick } from './pick-launch-profile.type';

const isMode = (profile: Profile, mode: LaunchMode): boolean => profile.randomizer?.mode === mode;

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
