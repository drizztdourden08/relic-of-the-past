/* @layer bridge-wasm @kind logic */
import { buildFeatureWord3 } from '../live-settings-flags';
import { DEFAULT_SETTINGS } from '../settings';
import { getModule } from '../wasm-bridge';
import { callIfExported } from './call-if-exported';
import { FEATURES3_GATE_WORD } from './live-settings.constants';
import { liveSettingsState } from './live-settings-state';

const reassertGateWord3 = (): void => {
  const mod = getModule();
  if (!mod) return;
  const settings = liveSettingsState.settings ?? DEFAULT_SETTINGS;
  callIfExported(() => mod.ccall('WasmSetGateWord', null, ['number', 'number'], [FEATURES3_GATE_WORD, buildFeatureWord3(settings)]));
};

export { reassertGateWord3 };
