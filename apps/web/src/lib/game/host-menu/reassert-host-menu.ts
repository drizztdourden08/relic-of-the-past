/* @layer bridge-wasm @kind logic */
import { wasmHostMenuSetTakeover } from '../bridge/host-menu';
import { hostMenuState } from './host-menu-state';
import { pushItem } from './push-item';

const reassertHostMenu = (): void => {
  wasmHostMenuSetTakeover(hostMenuState.wantedTakeover);
  if (hostMenuState.wantedTakeover) pushItem(hostMenuState.wantedItem);
};

export { reassertHostMenu };
