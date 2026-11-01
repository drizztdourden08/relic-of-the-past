/* @layer renderer-app @kind logic */
import { normalizeRandomizerOptions } from '@rotp/randomizer';
import type { CreateProfileOptions } from '@app/profiles/types';
import type { ApConnect } from '@app/launch-flags/ap-connect/ap-connect.type';
import { runCreateProfileFlow } from '@app/views/GameSession/behavior/create-profile-flow';
import { log } from '@app/log-bus';
import { baseOptionsOf } from './profile-seed';
import { probeSlotData } from './probe-slot-data';

const OPTIONS_SCHEMA = 'ap-options-v2';

/** Creates an online profile named `name` for the slot, with its options and seed read from the slot data the server holds. */
const createOnlineProfile = async (active: Profile, name: string, connect: ApConnect): Promise<Profile | null> => {
  const serverUrl = `${connect.host}:${connect.port}`;
  const probe = await probeSlotData({ url: serverUrl, slot: connect.slot, password: connect.password });
  if (!probe.ok) {
    log.app(`--ap-connect refused: the slot data of ${connect.slot} on ${serverUrl} could not be read (${probe.error})`, 'error');
    return null;
  }
  const { slotData } = probe;
  const opts: CreateProfileOptions = {
    ...baseOptionsOf(active, name),
    randomizer: {
      mode: 'online',
      seed: slotData.seed ?? connect.slot,
      options: normalizeRandomizerOptions({ schema: OPTIONS_SCHEMA, values: slotData.options }),
      serverUrl,
      slotName: connect.slot,
      ...(connect.password === null ? {} : { password: connect.password }),
      deathLink: slotData.deathLink,
      trackOtherPlayers: true,
    },
  };
  const result = await runCreateProfileFlow(opts);
  if (!result.success) {
    log.app(`--ap-connect refused: profile "${name}" could not be created (${result.error})`, 'error');
    return null;
  }
  log.app(`[LaunchConnect] Created online profile "${name}" for slot ${connect.slot} from its slot data`);
  return result.profile;
};

export { createOnlineProfile };
