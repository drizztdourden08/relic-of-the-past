/* @layer renderer-lib @kind logic */
import { MSU1_SAMPLE_RATE } from '../../decode/parse-msu1';
import type { ResolvedLayer } from '../layer-window';
import { bufferAt } from '../layer-window';
import type { PlaySource, ScheduleOptions } from '../place-source';
import { runScheduleLoop } from './run-schedule-loop';

const scheduleHardCutLoop = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  const { buffers, layer } = resolved;

  const loopStart = buffers.length === 1
    ? Math.min((layer.loopSample ?? 0) / MSU1_SAMPLE_RATE, bufferAt(resolved, 0).duration)
    : 0;

  runScheduleLoop(resolved, options, (buffer, at, isOpeningPass) => {
    const offset = isOpeningPass ? 0 : loopStart;
    const played = buffer.duration - offset;
    if (played > 0) play(buffer, at, offset);
    return played;
  });
};

export { scheduleHardCutLoop };
