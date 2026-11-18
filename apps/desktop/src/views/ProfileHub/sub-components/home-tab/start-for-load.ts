/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { checkLoadable } from '@rotp/game-core';
import { nav } from '@drizztdourden08/brock-react';
import { toast } from '@drizztdourden08/tessera/composites';
import { ensureGameRunning } from './ensure-game-running';
import { TOAST_DURATION_MS } from './home-tab.constants';

const refusalOf = (buffer: ArrayBuffer | null, t: I18n['t']): string | null => {
  if (!buffer) return t('profiles:home.load.unreadable');
  const verdict = checkLoadable(buffer);
  return verdict.ok ? null : t('profiles:home.load.stale', { reason: verdict.message });
};

const startForLoad = async (buffer: ArrayBuffer | null, isGameRunning: boolean, onStartGame: () => void, t: I18n['t']): Promise<boolean> => {
  const refusal = refusalOf(buffer, t);
  if (refusal === null) {
    const ready = await ensureGameRunning(isGameRunning, onStartGame);
    if (ready) nav.close();
    return ready;
  }
  toast({ message: refusal, variant: 'danger', duration: TOAST_DURATION_MS });
  return false;
};

export { startForLoad };
