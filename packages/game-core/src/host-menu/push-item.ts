/* @layer bridge-wasm @kind logic */
import { wasmHostSetActiveItem } from '../bridge/host-menu';
import { NO_HUD_ITEM } from './host-menu.constants';

const pushItem = (hudItem: number): void => {
  if (hudItem !== NO_HUD_ITEM) wasmHostSetActiveItem(hudItem);
};

export { pushItem };
