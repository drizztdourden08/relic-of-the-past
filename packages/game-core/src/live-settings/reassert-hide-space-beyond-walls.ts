/* @layer bridge-wasm @kind logic */
import { liveSettingsState } from './live-settings-state';
import { tryVoidCcall } from './try-void-ccall';

const reassertHideSpaceBeyondWalls = (): void =>
  tryVoidCcall('WasmSetHideSpaceBeyondWalls', liveSettingsState.hideSpaceBeyondWalls ? 1 : 0);

export { reassertHideSpaceBeyondWalls };
