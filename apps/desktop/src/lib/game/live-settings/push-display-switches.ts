/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { pushTurboSpeed } from '../turbo';
import type { EmscriptenModule } from '../types';
import { callIfExported } from './call-if-exported';
import { liveHidesOf } from './live-hides-of';
import { liveSettingsState } from './live-settings-state';

const pushDisplaySwitches = (mod: EmscriptenModule, settings: GameSettings): void => {
  const state = liveSettingsState;
  callIfExported(() => mod.ccall('WasmSetDisplayPerf', null, ['number'], [settings.displayPerfInTitle ? 1 : 0]));
  callIfExported(() => {
    state.hideSpaceBeyondWalls = liveHidesOf(settings).hideSpaceBeyondWalls;
    mod.ccall('WasmSetHideSpaceBeyondWalls', null, ['number'], [state.hideSpaceBeyondWalls ? 1 : 0]);
  });
  callIfExported(() => {
    state.vsync = !!settings.vsync;
    mod.ccall('WasmSetVsync', null, ['number'], [settings.vsync ? 1 : 0]);
  });
  pushTurboSpeed(settings);
  callIfExported(() => {
    state.hudHidden = liveHidesOf(settings).hudHidden;
    mod.ccall('WasmSetHudHidden', null, ['number'], [state.hudHidden ? 1 : 0]);
  });
  callIfExported(() => {
    state.pauseHidden = liveHidesOf(settings).pauseHidden;
    mod.ccall('WasmSetPauseHidden', null, ['number'], [state.pauseHidden ? 1 : 0]);
  });
  callIfExported(() => {
    state.extraDungeon = !!settings.extraDungeon;
    mod.ccall('WasmSetExtraDungeonEnabled', null, ['number'], [settings.extraDungeon ? 1 : 0]);
  });
};

export { pushDisplaySwitches };
