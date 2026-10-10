/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from './layer-window';
import { bufferAt, intervalPoints } from './layer-window';
import type { PlaySource, ScheduleOptions } from './place-source';
import { MAX_EVENTS, startSource } from './place-source';
import { nextIndex, nextInRange, streamFor } from './prng';
import { scheduleLoop } from './schedule-loop';

const scheduleOnce = (play: PlaySource, resolved: ResolvedLayer): void => {
  play(bufferAt(resolved, 0), 0);
};

const scheduleRandom = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  if (resolved.layer.mode.kind !== 'random') return;
  const { minDelaySeconds, maxDelaySeconds, waitForCompletion } = resolved.layer.mode;
  const min = Math.max(0, Math.min(minDelaySeconds, maxDelaySeconds));
  const max = Math.max(0, Math.max(minDelaySeconds, maxDelaySeconds));
  const random = streamFor(options.seed, resolved.index);

  let at = nextInRange(random, min, max);
  for (let events = 0; events < MAX_EVENTS && at < options.windowSeconds; events += 1) {
    const buffer = bufferAt(resolved, nextIndex(random, resolved.buffers.length));
    play(buffer, at);
    const gap = nextInRange(random, min, max);
    const step = waitForCompletion ? buffer.duration + gap : gap;
    if (step <= 0) break;
    at += step;
  }
};

const scheduleInterval = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  if (resolved.layer.mode.kind !== 'interval') return;
  const points = intervalPoints(resolved.layer.mode.atSeconds);
  const cycle = points.at(-1);
  if (cycle === undefined) return;
  const { buffers } = resolved;

  for (let event = 0; event < MAX_EVENTS; event += 1) {
    const point = event % points.length;
    const at = Math.floor(event / points.length) * cycle + (points[point] ?? 0);
    if (at >= options.windowSeconds) break;
    play(bufferAt(resolved, buffers.length > 1 ? point % buffers.length : 0), at);
    const firedOnceWithNoCycle = cycle <= 0 && point === points.length - 1;
    if (firedOnceWithNoCycle) break;
  }
};

const scheduleLayer = (resolved: ResolvedLayer, options: ScheduleOptions): void => {
  const { ctx } = options;
  if (resolved.buffers.length === 0) return;

  const gain = ctx.createGain();
  gain.gain.value = Math.max(0, Math.min(100, resolved.layer.volume)) / 100;
  gain.connect(ctx.destination);
  const play: PlaySource = (buffer, when, offset, fade) =>
    startSource(ctx, gain, buffer, when, offset, fade);

  switch (resolved.layer.mode.kind) {
    case 'loop': scheduleLoop(play, resolved, options); break;
    case 'random': scheduleRandom(play, resolved, options); break;
    case 'interval': scheduleInterval(play, resolved, options); break;
    case 'once':
    default: scheduleOnce(play, resolved); break;
  }
};

export { scheduleLayer };
