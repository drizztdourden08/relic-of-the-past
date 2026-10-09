/* @layer bridge-wasm @kind logic */
import { reassertGateWord5 } from '../gate-word-5';
import { buildFeatureFlags, buildFeatureWords, getModule, liveSettingsState, tryVoidCcall } from '@rotp/game-core';

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
