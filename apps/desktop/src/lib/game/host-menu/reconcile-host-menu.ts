/* @layer bridge-wasm @kind logic */
import type { HostMenuState } from '@shared/game/types';
import { wasmHostSetActiveItem } from '../bridge/host-menu';
import { NO_HUD_ITEM } from './host-menu.constants';
import { hostMenuState } from './host-menu-state';
import { reassertHostMenu } from './reassert-host-menu';

const reconcileHostMenu = (live: HostMenuState): void => {
  const { wantedTakeover, wantedItem } = hostMenuState;
  const dropped = hostMenuState.lastHolding && !live.holding;
  hostMenuState.lastHolding = live.holding;
  if (wantedTakeover && dropped) {
    reassertHostMenu();
    return;
  }
  if (wantedTakeover && live.holding && wantedItem !== NO_HUD_ITEM && live.activeItem !== wantedItem) {
    wasmHostSetActiveItem(wantedItem);
  }
};

export { reconcileHostMenu };
