/* @layer renderer-lib @kind logic */
import { MSU1_SAMPLE_RATE } from '../../decode/parse-msu1';
import type { ResolvedLayer } from '../layer-window';
import type { PlaySource, ScheduleOptions } from '../place-source';
import { MAX_EVENTS } from '../place-source';
import { orderPicker } from './order-picker';

const scheduleHardCutLoop = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  const { windowSeconds, seed } = options;
  const { buffers, layer } = resolved;

  const loopStart = buffers.length === 1
    ? Math.min((layer.loopSample ?? 0) / MSU1_SAMPLE_RATE, buffers[0].duration)
    : 0;
  const advance = orderPicker(resolved, seed);

  let index = 0;
  let at = 0;
  for (let events = 0; events < MAX_EVENTS && at < windowSeconds; events += 1) {
    const buffer = buffers[index];
    const offset = events === 0 ? 0 : loopStart;
    const played = buffer.duration - offset;
    if (played <= 0) break;
    play(buffer, at, offset);
    at += played;
    index = advance(index);
  }
};

export { scheduleHardCutLoop };
