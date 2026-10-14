/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { syncControlSettings } from '@app/stores/control-scheme-store';
import { syncDialogStore } from './sync-dialog-store';
import { touchesDialogStore } from './touches-dialog-store';
import { syncTitleStore } from './sync-title-store';
import { touchesTitleStore } from './touches-title-store';
import { syncHudStore } from './sync-hud-store';
import { swapPlayerSprite } from './swap-player-sprite';
import { CONTROL_STORE_KEYS, HUD_STORE_KEYS } from './settings-effects.constants';

const syncStoresForPatch = (patch: Partial<GameSettings>, next: GameSettings): void => {
  if ('linkSprite' in patch) {
    void swapPlayerSprite(next.linkSprite);
  }

  if (HUD_STORE_KEYS.some((k) => k in patch)) {
    syncHudStore(next);
  }
  if (touchesDialogStore(patch)) {
    syncDialogStore(next);
  }
  if (touchesTitleStore(patch)) {
    syncTitleStore(next);
  }

  if (CONTROL_STORE_KEYS.some((k) => k in patch)) syncControlSettings(next);
};

export { syncStoresForPatch };
