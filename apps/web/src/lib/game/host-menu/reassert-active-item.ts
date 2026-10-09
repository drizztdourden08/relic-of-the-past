/* @layer bridge-wasm @kind logic */
import { hostMenuState } from './host-menu-state';
import { pushItem } from './push-item';

const reassertActiveItem = (): void => pushItem(hostMenuState.wantedItem);

export { reassertActiveItem };
