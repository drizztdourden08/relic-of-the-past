/* @layer bridge-wasm @kind logic */
import { liveSettingsState } from './live-settings-state';
import { tryVoidCcall } from './try-void-ccall';

const reassertPauseHidden = (): void => tryVoidCcall('WasmSetPauseHidden', liveSettingsState.pauseHidden ? 1 : 0);

export { reassertPauseHidden };
