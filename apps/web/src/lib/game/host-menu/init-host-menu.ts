/* @layer bridge-wasm @kind logic */
import type { GameState } from '../types';
import { getProfileId, subscribeGameState } from '../wasm-bridge';
import { NO_HUD_ITEM } from './host-menu.constants';
import { hostMenuState } from './host-menu-state';
import { reassertHostMenu } from './reassert-host-menu';

const resetHostMenu = (): void => {
  hostMenuState.wantedTakeover = false;
  hostMenuState.wantedItem = NO_HUD_ITEM;
  hostMenuState.lastHolding = false;
};

const onGameState = (state: GameState): void => {
  if (state.status !== 'running') { hostMenuState.lastHolding = false; return; }
  const profileId = getProfileId();
  const swapped = hostMenuState.seenProfileId !== null && profileId !== hostMenuState.seenProfileId;
  hostMenuState.seenProfileId = profileId;
  if (swapped) { resetHostMenu(); return; }
  if (hostMenuState.wantedTakeover) reassertHostMenu();
};

const initHostMenu = (): void => {
  if (hostMenuState.subscribed) return;
  hostMenuState.subscribed = true;
  subscribeGameState(onGameState);
};

export { initHostMenu };
