/* @layer bridge-wasm @kind logic */
import { liveSettingsState } from './live-settings-state';
import { tryVoidCcall } from './try-void-ccall';

const reassertExtraDungeon = (): void =>
  tryVoidCcall('WasmSetExtraDungeonEnabled', liveSettingsState.extraDungeon ? 1 : 0);

export { reassertExtraDungeon };
