/* @layer bridge-wasm @kind logic */
import { hostMenuState } from './host-menu-state';

const wantedActiveItem = (): number => hostMenuState.wantedItem;

export { wantedActiveItem };
