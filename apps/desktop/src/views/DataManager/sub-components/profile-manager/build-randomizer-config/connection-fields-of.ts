/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { RandomizerFormState } from './build-randomizer-config.type';

const slotOf = (name: string): Partial<ProfileRandomizerConfig> => (name.trim() === '' ? {} : { slotName: name.trim() });

const connectionFieldsOf = (form: RandomizerFormState, mode: RandomizerFormState['mode']): Partial<ProfileRandomizerConfig> => {
  if (mode === 'local') return {};
  const flags = { deathLink: form.deathLink, trackOtherPlayers: true };
  if (mode === 'archipelia') return { ...flags, ...slotOf(form.lobby.slotName) };
  return flags;
};

export { connectionFieldsOf };
