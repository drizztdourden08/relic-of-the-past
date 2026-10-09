/* @layer bridge-wasm @kind logic */
import { hostMenuState } from './host-menu-state';
import { reassertHostMenu } from './reassert-host-menu';

const reassertAfterSaveLoad = (): void => {
  hostMenuState.lastHolding = false;
  if (!hostMenuState.wantedTakeover) return;
  reassertHostMenu();
};

export { reassertAfterSaveLoad };
