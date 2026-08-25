/* @layer renderer-lib @kind logic */
/**
 * Renders a layered track down to one looping stereo buffer, which is all MSU-1 can hold: the
 * format is a single audio stream selected by a single track register, with no way to express
 * two things sounding at once. Export therefore mixes the layers together offline, at the
 * 44100 Hz the format mandates, and the layering only survives in our own `.msul` container.
 *
 * Reproducibility is a hard requirement here: every random choice comes from a seeded PRNG
 * (./prng) keyed off the track number, so exporting the same pack twice yields identical bytes.
 */
import type { MsuTrackDef } from '@shared/types/msu-manifest';
import { MSU1_CHANNELS, MSU1_SAMPLE_RATE } from '../decode/parse-msu1';
import type { ResolvedLayer } from './layer-window';
import { dominantLoopLayer, loopCrossfadeSeconds, renderWindowSeconds, resolveLayers } from './layer-window';
import { scheduleLayer } from './schedule-layer';

interface FlattenOptions {
  /** Defaults to the track number, so tracks differ from each other but never from themselves. */
  seed?: number;
}

interface FlattenedTrack {
  /** Planar stereo at 44100 Hz, ready for ./write-pcm. */
  channels: Float32Array[];
  /** Frame to restart from — see the note on carriedLoopPoint. */
  loopSample: number;
}

/**
 * THE LOOP-POINT CHOICE.
 *
 * The flattened stream loops as a whole, so `loopSample` is 0 in almost every case: the render
 * window IS one pass of the loop layer, and a player restarting at frame 0 hears exactly what
 * the engine would have played.
 *
 * The one exception is the case that matters most in practice — a track whose body is a single
 * file with its own loop point (every classic pack track, and any authored track built the same
 * way). There, dropping the loop point would either lose the intro or make the intro repeat
 * forever. Instead that layer is rendered as ONE pass (no repeats) and its loop point is carried
 * into the MSU-1 header, so the player performs the intro-then-loop itself, natively.
 *
 * The trade-off, accepted knowingly: other layers rendered into the intro region [0, loopSample)
 * are heard only on the first pass. A one-shot sting placed over an intro is exactly what that
 * region is for, so this is usually right; an ambient layer will thin out after the first pass.
 *
 * A CROSSFADED loop layer is excluded, and that is the second half of the same decision. Live,
 * a crossfade abandons native looping entirely (loop-scheduler.ts re-triggers each pass by hand,
 * from the top of the file, ignoring its loop point), so carrying that loop point here would
 * export a behaviour the preview never produces — and rendering the layer as one pass would drop
 * every crossfade with it. So a crossfaded track exports with loopSample 0, meaning: the whole
 * flattened window IS the loop, and a player restarting at frame 0 restarts the cycle.
 *
 * What that costs, stated plainly: the render window is one crossfaded cycle, so every crossfade
 * INSIDE the cycle is reproduced exactly, and the one join left uncovered is the wrap from the
 * window's last frame back to frame 0. There the outgoing pass is truncated mid-tail and the
 * opening pass begins at full gain — a hard cut, once per cycle, in the same place and of the
 * same kind as the seam a zero-crossfade pack already has at every pass boundary. The
 * alternatives were worse: fading the last pass out and the first in would put an audible dip
 * at the loop point of every cycle, and folding the outgoing tail into the head of the stream is
 * only well-defined for a sequential pool, not for a shuffled one, which is where crossfades are
 * asked for most.
 */
const carriedLoopPoint = (dominant: ResolvedLayer | null): number | null => {
  if (!dominant || dominant.buffers.length !== 1) return null;
  if (loopCrossfadeSeconds(dominant.layer) > 0) return null;
  const loopSample = dominant.layer.loopSample ?? 0;
  if (loopSample <= 0) return null;
  const frames = Math.floor(dominant.buffers[0].duration * MSU1_SAMPLE_RATE);
  return loopSample < frames ? loopSample : null;
};

const emptyResult = (): FlattenedTrack => ({
  channels: [new Float32Array(0), new Float32Array(0)],
  loopSample: 0,
});

const flattenTrack = async (track: MsuTrackDef, files: Map<string, AudioBuffer>,
  options?: FlattenOptions): Promise<FlattenedTrack> => {
  const layers = resolveLayers(track, files);
  if (layers.length === 0) return emptyResult();

  const dominant = dominantLoopLayer(layers);
  const carried = carriedLoopPoint(dominant);
  // Carrying a loop point means the body plays once, so the window is that one pass.
  const windowSeconds = carried !== null && dominant
    ? Math.min(dominant.buffers[0].duration, renderWindowSeconds(layers))
    : renderWindowSeconds(layers);
  if (windowSeconds <= 0) return emptyResult();

  const frames = Math.max(1, Math.ceil(windowSeconds * MSU1_SAMPLE_RATE));
  const ctx = new OfflineAudioContext(MSU1_CHANNELS, frames, MSU1_SAMPLE_RATE);
  const seed = options?.seed ?? track.trackNum;

  for (const resolved of layers) {
    scheduleLayer(resolved, {
      ctx,
      windowSeconds,
      seed,
      singlePass: carried !== null && resolved === dominant,
    });
  }

  const rendered = await ctx.startRendering();
  const channels: Float32Array[] = [];
  for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
    channels.push(rendered.getChannelData(channel));
  }

  return { channels, loopSample: carried ?? 0 };
};

export { flattenTrack, carriedLoopPoint };
export type { FlattenOptions, FlattenedTrack };
