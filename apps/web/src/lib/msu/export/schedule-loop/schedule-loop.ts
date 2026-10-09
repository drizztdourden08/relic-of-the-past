/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from '../layer-window';
import { loopCrossfadeSeconds } from '../layer-window';
import type { PlaySource, ScheduleOptions } from '../place-source';
import { scheduleCrossfadedLoop } from './schedule-crossfaded-loop';
import { scheduleHardCutLoop } from './schedule-hard-cut-loop';

const scheduleLoop = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  if (options.singlePass) { play(resolved.buffers[0], 0); return; }
  if (loopCrossfadeSeconds(resolved.layer) > 0) scheduleCrossfadedLoop(play, resolved, options);
  else scheduleHardCutLoop(play, resolved, options);
};

export { scheduleLoop };
