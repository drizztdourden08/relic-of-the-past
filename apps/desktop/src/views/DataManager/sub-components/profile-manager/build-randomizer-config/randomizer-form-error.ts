/* @layer renderer-components @kind logic */
import { slotNameError } from '@rotp/randomizer';
import { absorbPort, draftError } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { NO_LOBBY_ERROR, NO_SEED_ERROR } from './build-randomizer-config.constants';
import type { RandomizerFormState } from './build-randomizer-config.type';

const randomizerFormError = (form: RandomizerFormState, experimental: boolean): string | undefined => {
  if (!form.enabled) return undefined;
  if (form.seed.trim() === '') return NO_SEED_ERROR;
  if (form.mode === 'archipelia') {
    return slotNameError(form.lobby.slotName) ?? (form.lobbyCheck.kind === 'ok' ? undefined : NO_LOBBY_ERROR);
  }
  return experimental && form.mode === 'online' ? draftError(absorbPort(form.server)) ?? undefined : undefined;
};

export { randomizerFormError };
