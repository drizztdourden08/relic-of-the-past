/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { updateHapticBridgeSettings, updateHapticsProfileEnabled } from '@rotp/input-mapping';
import { log } from '../../log-bus';
import { buildFeatureFlags, buildFeatureWord3, buildFeatureWords, buildPpuFlags, DEFAULT_SETTINGS, getModule, callIfExported, FEATURES3_GATE_WORD, liveSettingsState, pushDisplaySwitches } from '@rotp/game-core';
import { pushDialogLive } from '../live-settings-dialog';
import { setSettingsStoryGates } from '../story-gates';
import type { EmscriptenModule } from '@rotp/game-core';
import { pushVolumes } from '@rotp/msu';

const pushFeatureWords = (mod: EmscriptenModule, settings: GameSettings): number => {
  const features = buildFeatureFlags(settings);
  mod.ccall('WasmSetFeatures', null, ['number'], [features]);
  const { features1, features2 } = buildFeatureWords(settings);
  callIfExported(() => mod.ccall('WasmSetFeatures1', null, ['number'], [features1]));
  callIfExported(() => mod.ccall('WasmSetFeatures2', null, ['number'], [features2]));
  callIfExported(() => mod.ccall('WasmSetGateWord', null, ['number', 'number'], [FEATURES3_GATE_WORD, buildFeatureWord3(settings)]));
  setSettingsStoryGates(settings.vanillaSafe);
  return features;
};

const applyLiveSettings = (settings: GameSettings): void => {
  const mod = getModule();
  if (!mod) return;
  liveSettingsState.settings = settings;
  const features = pushFeatureWords(mod, settings);
  const ppuFlags = buildPpuFlags(settings);
  mod.ccall('WasmSetPpuRenderFlags', null, ['number'], [ppuFlags]);
  pushVolumes(mod, settings);
  pushDisplaySwitches(mod, settings);
  pushDialogLive(settings);
  updateHapticBridgeSettings(settings.haptics ?? DEFAULT_SETTINGS.haptics);
  updateHapticsProfileEnabled(settings.hapticsEnabled ?? DEFAULT_SETTINGS.hapticsEnabled);
  log.app(`Live settings pushed: features 0x${features.toString(16)}, ppu 0x${ppuFlags.toString(16)}`);
};

export { applyLiveSettings };
