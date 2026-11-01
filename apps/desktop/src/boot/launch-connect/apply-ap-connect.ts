/* @layer renderer-app @kind logic */
import { loadProfile } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';
import { applyConnectionPatch } from '@app/profiles/connection-patch/randomizer-connection-patch';
import { updateProfile } from '@app/storage/profile-store';
import type { ApConnect } from '@app/launch-flags/ap-connect/ap-connect.type';

const refuse = (why: string): false => {
  log.app(`--ap-connect refused: ${why}`, 'error');
  return false;
};

const applyApConnect = async (profile: Profile, connect: ApConnect): Promise<boolean> => {
  const stored = await loadProfile(profile.id);
  if (stored === null) return refuse(`profile "${profile.name}" is gone`);
  if (stored.randomizer?.mode !== 'online') return refuse(`profile "${profile.name}" is not an Archipelago (online) profile`);
  const randomizer = applyConnectionPatch(stored.randomizer, {
    serverUrl: `${connect.host}:${connect.port}`, slotName: connect.slot, password: connect.password,
  });
  if ((await updateProfile(profile.id, { randomizer })) === null) return refuse(`profile "${profile.name}" could not be updated`);
  log.app(`[LaunchConnect] Profile "${profile.name}" points at ${connect.host}:${connect.port} as slot ${connect.slot}`);
  return true;
};

export { applyApConnect };
