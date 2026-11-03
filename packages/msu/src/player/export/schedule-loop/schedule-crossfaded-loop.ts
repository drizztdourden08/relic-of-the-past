/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from '../layer-window';
import { crossfadeWindowSeconds, loopCrossfadeSeconds } from '../layer-window';
import type { PlaySource, ScheduleOptions } from '../place-source';
import { runScheduleLoop } from './run-schedule-loop';

const scheduleCrossfadedLoop = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  const crossfade = loopCrossfadeSeconds(resolved.layer);

  runScheduleLoop(resolved, options, (buffer, at, isOpeningPass) => {
    const window = crossfadeWindowSeconds(buffer.duration, crossfade);
    const handoffIn = Math.max(0, buffer.duration - window);
    play(buffer, at, 0, {
      fadeInSeconds: isOpeningPass ? 0 : window,
      fadeOutAfterSeconds: handoffIn,
      fadeOutSeconds: window,
    });
    return handoffIn;
  });
};

export { scheduleCrossfadedLoop };
