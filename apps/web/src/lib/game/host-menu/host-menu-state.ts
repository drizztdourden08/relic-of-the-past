/* @layer bridge-wasm @kind logic */
import { NO_HUD_ITEM } from './host-menu.constants';

const hostMenuState = {
  wantedTakeover: false,
  wantedItem: NO_HUD_ITEM as number,
  lastHolding: false,
  seenProfileId: null as string | null,
  subscribed: false,
};

export { hostMenuState };
