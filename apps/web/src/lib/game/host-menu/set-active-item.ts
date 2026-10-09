/* @layer bridge-wasm @kind logic */
import { wasmHostSetActiveItem } from '../bridge/host-menu';
import { FIRST_HUD_ITEM, LAST_HUD_ITEM } from './host-menu.constants';
import { hostMenuState } from './host-menu-state';

const setActiveItem = (hudItem: number): void => {
  if (!Number.isInteger(hudItem) || hudItem < FIRST_HUD_ITEM || hudItem > LAST_HUD_ITEM) return;
  if (hudItem === hostMenuState.wantedItem) return;
  hostMenuState.wantedItem = hudItem;
  wasmHostSetActiveItem(hudItem);
};

export { setActiveItem };
