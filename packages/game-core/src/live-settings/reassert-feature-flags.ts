/* @layer bridge-wasm @kind logic */
import { buildFeatureFlags } from '../live-settings-flags';
import { DEFAULT_SETTINGS } from '../settings';
import { getModule } from '../wasm-bridge';
import { callIfExported } from './call-if-exported';
import { liveSettingsState } from './live-settings-state';

const reassertFeatureFlags = (): void => {
  const mod = getModule();
  if (!mod) return;
  const settings = liveSettingsState.settings ?? DEFAULT_SETTINGS;
  callIfExported(() => mod.ccall('WasmSetFeatures', null, ['number'], [buildFeatureFlags(settings)]));
};

export { reassertFeatureFlags };
