/* @layer bridge-wasm @kind logic */
import { setSoundTrace } from '@rotp/game-core';
import { musicDebugState } from './music-debug-state';

const setMusicDebugArmed = (on: boolean): void => {
  musicDebugState.armed = on;
  setSoundTrace(on);
};

export { setMusicDebugArmed };
