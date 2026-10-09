/* @layer bridge-wasm @kind logic */
import { wasmHostMenuSetTakeover } from '../bridge/host-menu';
import { hostMenuState } from './host-menu-state';
import { pushItem } from './push-item';

const setTakeover = (on: boolean): void => {
  hostMenuState.wantedTakeover = on;
  wasmHostMenuSetTakeover(on);
  if (on) pushItem(hostMenuState.wantedItem);
};

export { setTakeover };
