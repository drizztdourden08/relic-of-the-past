/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { absorbPort, serverUrlOf } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { RandomizerFormState } from './build-randomizer-config.type';

const slotOf = (name: string): Partial<ProfileRandomizerConfig> => (name.trim() === '' ? {} : { slotName: name.trim() });

const connectionFieldsOf = (form: RandomizerFormState, mode: RandomizerFormState['mode']): Partial<ProfileRandomizerConfig> => {
  if (mode === 'local') return {};
  const flags = { deathLink: form.deathLink, trackOtherPlayers: form.trackOtherPlayers };
  if (mode === 'archipelia') return { ...flags, ...slotOf(form.lobby.slotName) };
  const server = absorbPort(form.server);
  return {
    ...flags,
    ...(server.host.trim() === '' ? {} : { serverUrl: serverUrlOf(server) }),
    ...slotOf(server.slotName),
    ...(server.password === '' ? {} : { password: server.password }),
  };
};

export { connectionFieldsOf };
