/* @layer renderer-lib @kind logic */
/**
 * Unrolls a `loop` layer onto the offline timeline, in whichever of the two shapes
 * ../schedulers/loop-scheduler.ts would have used.
 *
 * Without a crossfade the live graph either lets one file loop on itself or chains a pool
 * end-to-start; both come out here as passes butted together, each repeat entering at the file's
 * own loop point. With a crossfade the live scheduler abandons native looping and chains passes
 * by hand so they overlap, which is reproduced pass for pass below.
 */
import { MSU1_SAMPLE_RATE } from '../decode/parse-msu1';
import type { ResolvedLayer } from './layer-window';
import { crossfadeWindowSeconds, loopCrossfadeSeconds } from './layer-window';
import type { PlaySource, ScheduleOptions } from './place-source';
import { MAX_EVENTS } from './place-source';
import { nextIndex, streamFor } from './prng';

/** Sequential advances by one; `random` order never repeats a file twice running, as live. */
const orderPicker = (resolved: ResolvedLayer, seed: number): ((current: number) => number) => {
  const count = resolved.buffers.length;
  const order = resolved.layer.mode.kind === 'loop' ? resolved.layer.mode.order : 'sequential';
  if (count <= 1) return () => 0;
  if (order === 'sequential') return (current) => (current + 1) % count;
  const random = streamFor(seed, resolved.index);
  return (current) => {
    let candidate = current;
    while (candidate === current) candidate = nextIndex(random, count);
    return candidate;
  };
};

/** Hard-cut chaining: one pass at a time, the next starting where this one ends. */
const scheduleHardCutLoop = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  const { windowSeconds, seed } = options;
  const { buffers, layer } = resolved;

  // A lone file repeats from its own loop point, the way the live graph's looping source does;
  // a pool always restarts each file from the top. A layer's loopSample is defined at 44100 Hz
  // whatever rate the file itself carries, so it converts against that rate and not the buffer's.
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

/**
 * Crossfaded chaining, mirroring that scheduler's `playFaded`: a pass starts `window` seconds
 * before the previous one ends and rises from silence while that one falls to it, so the two
 * overlap. Three details are the live ones and matter:
 *  - the window is clamped per file to half its length, so a file shorter than the crossfade
 *    still completes its rise;
 *  - the outgoing fade lasts the OUTGOING file's window and the incoming rise the incoming
 *    file's, which differ when the two files' lengths straddle the clamp;
 *  - a pass always begins at the top of its file, because the crossfaded path gives up native looping,
 *    so a file's own loop point takes no part in it.
 */
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
    play(buffer, at, 0, {
      // The opening pass has nothing to rise over, the same as the live scheduler's first call.
      fadeInSeconds: events === 0 ? 0 : window,
      fadeOutAfterSeconds: handoffIn,
      fadeOutSeconds: window,
    });
    if (handoffIn <= 0) break;
    at += handoffIn;
    index = advance(index);
  }
};

const scheduleLoop = (play: PlaySource,
  resolved: ResolvedLayer, options: ScheduleOptions): void => {
  if (options.singlePass) { play(resolved.buffers[0], 0); return; }
  if (loopCrossfadeSeconds(resolved.layer) > 0) scheduleCrossfadedLoop(play, resolved, options);
  else scheduleHardCutLoop(play, resolved, options);
};

export { scheduleLoop, orderPicker };
