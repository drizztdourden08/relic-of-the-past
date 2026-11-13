/* @layer renderer-components @kind logic */
import { checkLoadable } from '@rotp/game-core';
import { nav } from '@drizztdourden08/brock-react';
import { toast } from '@drizztdourden08/tessera/composites';
import { ensureGameRunning } from './ensure-game-running';
import { MISSING_STATE_MESSAGE, STALE_STATE_HINT, TOAST_DURATION_MS } from './home-tab.constants';

const refusalOf = (buffer: ArrayBuffer | null): string | null => {
  if (!buffer) return MISSING_STATE_MESSAGE;
  const verdict = checkLoadable(buffer);
  return verdict.ok ? null : `${verdict.message} ${STALE_STATE_HINT}`;
};

const startForLoad = async (buffer: ArrayBuffer | null, isGameRunning: boolean, onStartGame: () => void): Promise<boolean> => {
  const refusal = refusalOf(buffer);
  if (refusal === null) {
    const ready = await ensureGameRunning(isGameRunning, onStartGame);
    if (ready) nav.close();
    return ready;
  }
  toast({ message: refusal, variant: 'danger', duration: TOAST_DURATION_MS });
  return false;
};

export { startForLoad };
