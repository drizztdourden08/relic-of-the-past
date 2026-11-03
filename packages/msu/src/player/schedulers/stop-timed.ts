/* @layer renderer-lib @kind logic */
import type { TimedState } from './timed-state.type';

const stopTimed = (state: TimedState): void => {
  if (state.timer !== null) clearTimeout(state.timer);
  state.timer = null;
  state.live.forEach((v) => v.voice.stop());
  state.live = [];
};

export { stopTimed };
