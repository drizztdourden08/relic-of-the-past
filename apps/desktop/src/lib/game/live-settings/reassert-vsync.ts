/* @layer bridge-wasm @kind logic */
import { liveSettingsState } from './live-settings-state';
import { tryVoidCcall } from './try-void-ccall';

const reassertVsync = (): void => tryVoidCcall('WasmSetVsync', liveSettingsState.vsync ? 1 : 0);

export { reassertVsync };
