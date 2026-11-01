/* @layer renderer-app @kind logic */
import { loadProfile } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';
import { applyConnectionPatch } from '@app/profiles/connection-patch/randomizer-connection-patch';
import { updateProfile } from '@app/storage/profile-store';
import type { ApConnect } from '@app/launch-flags/ap-connect/ap-connect.type';
import { createOnlineProfile } from './create-online-profile';
import { pickLaunchProfile } from './pick-launch-profile';

const refuse = (why: string): null => {
  log.app(`--ap-connect refused: ${why}`, 'error');
  return null;
};

const repoint = async (profile: Profile, connect: ApConnect): Promise<Profile | null> => {
  const stored = await loadProfile(profile.id);
  if (stored === null) return refuse(`profile "${profile.name}" is gone`);
  if (stored.randomizer?.mode !== 'online') return refuse(`profile "${profile.name}" is not an Archipelago (online) profile`);
  const randomizer = applyConnectionPatch(stored.randomizer, {
    serverUrl: `${connect.host}:${connect.port}`, slotName: connect.slot, password: connect.password,
  });
  const updated = await updateProfile(profile.id, { randomizer });
  if (updated === null) return refuse(`profile "${profile.name}" could not be updated`);
  log.app(`[LaunchConnect] Profile "${profile.name}" points at ${connect.host}:${connect.port} as slot ${connect.slot}`);
  return profile;
};

/** Returns the profile the launch goes on with: the one that fits, re-pointed at the server, or a new one named after the slot. */
const applyApConnect = async (active: Profile, connect: ApConnect, explicitName: string | null): Promise<Profile | null> => {
  const pick = await pickLaunchProfile(active, 'online', explicitName, connect.slot);
  if (pick.kind === 'refuse') return refuse(pick.why);
  if (pick.kind === 'create') return createOnlineProfile(active, pick.name, connect);
  return repoint(pick.profile, connect);
};

export { applyApConnect };
