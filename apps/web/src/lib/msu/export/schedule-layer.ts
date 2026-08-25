/* @layer renderer-lib @kind logic */
/**
 * Places one layer's sources on an offline render timeline, reproducing what its live
 * scheduler (../schedulers/*) would have done over the same stretch of time.
 *
 * The live schedulers are event-driven — a timer fires, a voice starts. Offline there is no
 * clock, so the same rules are unrolled ahead of time into `start(when)` calls. Each mode is
 * matched deliberately: `random` uses a gap-then-fire order (the live one waits before its
 * first event), and `interval` walks its offsets as a cycle whose length is the last offset,
 * both exactly as those files do it. `loop` is involved enough to live in ./schedule-loop.
 */
import type { ResolvedLayer } from './layer-window';
import { intervalPoints } from './layer-window';
import type { PlaySource, ScheduleOptions } from './place-source';
import { MAX_EVENTS, startSource } from './place-source';
import { nextIndex, nextInRange, streamFor } from './prng';
import { scheduleLoop } from './schedule-loop';

const scheduleOnce = (play: PlaySource, resolved: ResolvedLayer): void => {
  play(resolved.buffers[0], 0);
};

const scheduleRandom = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  if (resolved.layer.mode.kind !== 'random') return;
  const { minDelaySeconds, maxDelaySeconds, waitForCompletion } = resolved.layer.mode;
  const min = Math.max(0, Math.min(minDelaySeconds, maxDelaySeconds));
  const max = Math.max(0, Math.max(minDelaySeconds, maxDelaySeconds));
  const random = streamFor(options.seed, resolved.index);

  // The live scheduler waits a gap before its first event, so the first one is not at t=0.
  let at = nextInRange(random, min, max);
  for (let events = 0; events < MAX_EVENTS && at < options.windowSeconds; events += 1) {
    const buffer = resolved.buffers[nextIndex(random, resolved.buffers.length)];
    play(buffer, at);
    // The gap is drawn either way, so the option changes only the spacing and never the sequence
    // of choices: one seed keeps picking the same files however the pack is authored.
    const gap = nextInRange(random, min, max);
    // Waiting for completion measures the gap from where this sound ENDS, so nothing overlaps;
    // otherwise it is measured from the start and a long sound runs into the next one.
    const step = waitForCompletion ? buffer.duration + gap : gap;
    if (step <= 0) break;
    at += step;
  }
};

const scheduleInterval = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  if (resolved.layer.mode.kind !== 'interval') return;
  const points = intervalPoints(resolved.layer.mode.atSeconds);
  if (points.length === 0) return;
  // The cycle repeats every `last offset`, which is what the live scheduler's wrap-around gap
  // works out to, and each offset draws the file at its own position in the list.
  const cycle = points[points.length - 1];
  const { buffers } = resolved;

  for (let event = 0; event < MAX_EVENTS; event += 1) {
    const point = event % points.length;
    const at = Math.floor(event / points.length) * cycle + points[point];
    if (at >= options.windowSeconds) break;
    play(buffers[buffers.length > 1 ? point % buffers.length : 0], at);
    // Every offset at zero has no cycle to repeat: fire the list once and stop.
    if (cycle <= 0 && point === points.length - 1) break;
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
    default: scheduleOnce(play, resolved); break;
  }
};

export { scheduleLayer };
