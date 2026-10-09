/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { updateHapticBridgeSettings, updateHapticsProfileEnabled } from '@rotp/input-mapping';
import { log } from '../../log-bus';
import { buildFeatureFlags, buildFeatureWord3, buildFeatureWords } from '@rotp/game-core';
import { pushDialogLive } from '../live-settings-dialog';
import { buildPpuFlags } from '@rotp/game-core';
import { DEFAULT_SETTINGS } from '@rotp/game-core';
import { setSettingsStoryGates } from '../story-gates';
import type { EmscriptenModule } from '@rotp/game-core';
import { getModule } from '@rotp/game-core';
import { callIfExported } from '@rotp/game-core';
import { FEATURES3_GATE_WORD } from '@rotp/game-core';
import { liveSettingsState } from '@rotp/game-core';
import { pushDisplaySwitches } from '@rotp/game-core';
import { pushVolumes } from './push-volumes';

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

const pushLiveSettings = (settings: GameSettings): boolean => {
  setSettingsStoryGates(settings.vanillaSafe);
  const mod = getModule();
  if (!mod) {
    log.app('Live settings: no WASM module available', 'warn');
    return false;
  }
  try {
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
    return true;
  } catch (e) {
    log.app(`Live settings push failed: ${e}`, 'error');
    return false;
  }
};

export { pushLiveSettings };
