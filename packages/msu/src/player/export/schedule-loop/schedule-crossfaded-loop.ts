/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from '../layer-window';
import { crossfadeWindowSeconds, loopCrossfadeSeconds } from '../layer-window';
import type { PlaySource, ScheduleOptions } from '../place-source';
import { MAX_EVENTS } from '../place-source';
import { orderPicker } from './order-picker';

const scheduleCrossfadedLoop = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  const { windowSeconds, seed } = options;
  const { buffers } = resolved;
  const crossfade = loopCrossfadeSeconds(resolved.layer);
  const advance = orderPicker(resolved, seed);

  let index = 0;
  let at = 0;
  for (let events = 0; events < MAX_EVENTS && at < windowSeconds; events += 1) {
    const buffer = buffers[index];
    const window = crossfadeWindowSeconds(buffer.duration, crossfade);
    const handoffIn = Math.max(0, buffer.duration - window);
    const isOpeningPass = events === 0;
    play(buffer, at, 0, {
      fadeInSeconds: isOpeningPass ? 0 : window,
      fadeOutAfterSeconds: handoffIn,
      fadeOutSeconds: window,
    });
    if (handoffIn <= 0) break;
    at += handoffIn;
    index = advance(index);
  }
};

export { scheduleCrossfadedLoop };
