/* @layer bridge-wasm @kind logic */
import { reassertGateWord5 } from '../gate-word-5';
import { buildFeatureFlags, buildFeatureWords } from '../live-settings-flags';
import { getModule } from '../wasm-bridge';
import { liveSettingsState } from './live-settings-state';
import { tryVoidCcall } from './try-void-ccall';

const reassertFeatureWords = (): void => {
  const { settings } = liveSettingsState;
  if (!getModule() || !settings) return;
  const { features1, features2 } = buildFeatureWords(settings);
  tryVoidCcall('WasmSetFeatures', buildFeatureFlags(settings));
  tryVoidCcall('WasmSetFeatures1', features1);
  tryVoidCcall('WasmSetFeatures2', features2);
  reassertGateWord5();
};

export { reassertFeatureWords };
