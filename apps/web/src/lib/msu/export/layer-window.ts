/* @layer renderer-lib @kind logic */
/**
 * Works out how long a flattened track has to be, and which layer sets that length.
 *
 * The musical body of a track is its `loop` layer: that layer is what plays for as long as the
 * area is on screen, so one pass of it is the natural loop period for the single stream MSU-1
 * gives us. Everything else (a one-shot sting, an ambient gust, a timed cue) is placed inside
 * that window. A track with no loop layer at all falls back to the longest span any of its
 * layers occupies, so a fanfare-only track is still rendered whole.
 */
import type { MsuLayer, MsuTrackDef } from '@shared/types/msu-manifest';

interface ResolvedLayer {
  layer: MsuLayer;
  /** Position in the track's layer list — the PRNG stream is derived from it. */
  index: number;
  /** Decoded buffers in the layer's own file order. Files that failed to load are dropped. */
  buffers: AudioBuffer[];
}

/** Ten minutes. A manifest is user-authored, so the render length is capped, not trusted. */
const MAX_RENDER_SECONDS = 600;

const totalSeconds = (buffers: AudioBuffer[]): number =>
  buffers.reduce((sum, b) => sum + b.duration, 0);

const longestSeconds = (buffers: AudioBuffer[]): number =>
  buffers.reduce((max, b) => Math.max(max, b.duration), 0);

/** Sorted, de-duplicated interval offsets — the same normalisation the interval scheduler does. */
const intervalPoints = (atSeconds: number[]): number[] =>
  [...new Set(atSeconds.filter((s) => Number.isFinite(s) && s >= 0))].sort((a, b) => a - b);

/**
 * The crossfade a `loop` layer asked for, floored at zero and otherwise taken as written — the
 * same reading ../schedulers/loop-scheduler.ts does. MAX_CROSSFADE_SECONDS is the author-facing
 * ceiling the editor validates against, deliberately not re-applied here: clamping a manifest the
 * live engine would honour as-is is exactly how a render stops matching its preview.
 */
const loopCrossfadeSeconds = (layer: MsuLayer): number =>
  (layer.mode.kind === 'loop' ? Math.max(0, layer.mode.crossfadeSeconds ?? 0) : 0);

/**
 * Overlap between one pass of a file and the next. Clamped to half the file, as the live
 * scheduler does, so a file shorter than the crossfade still completes its rise.
 */
const crossfadeWindowSeconds = (durationSeconds: number, crossfade: number): number =>
  Math.max(0, Math.min(crossfade, durationSeconds / 2));

/**
 * One full pass of a `loop` layer's pool: a single file's length, or every file back to back.
 *
 * With a crossfade the passes overlap, so a cycle is SHORTER than the sum of its files by one
 * window per file — each pass hands over `window` seconds before it ends. Getting this wrong
 * would leave the render window longer than a cycle, and the flattened stream would then repeat
 * material that the loop point has already brought back around.
 */
const loopCycleSeconds = (resolved: ResolvedLayer): number => {
  const crossfade = loopCrossfadeSeconds(resolved.layer);
  if (crossfade <= 0) return totalSeconds(resolved.buffers);
  return resolved.buffers.reduce(
    (sum, b) => sum + b.duration - crossfadeWindowSeconds(b.duration, crossfade), 0,
  );
};

/** How much time a layer occupies before it starts repeating itself. */
const spanSeconds = (resolved: ResolvedLayer): number => {
  const { layer, buffers } = resolved;
  switch (layer.mode.kind) {
    case 'loop':
      return loopCycleSeconds(resolved);
    case 'interval': {
      const points = intervalPoints(layer.mode.atSeconds);
      return (points[points.length - 1] ?? 0) + longestSeconds(buffers);
    }
    case 'random':
      return Math.max(0, layer.mode.minDelaySeconds) + longestSeconds(buffers);
    default:
      return buffers[0]?.duration ?? 0;
  }
};

/**
 * The loop layer whose pass is longest. It is the one whose own loop point can survive the
 * flatten (see flatten-track), so it is picked out rather than just measured.
 */
const dominantLoopLayer = (layers: ResolvedLayer[]): ResolvedLayer | null => {
  let best: ResolvedLayer | null = null;
  for (const resolved of layers) {
    if (resolved.layer.mode.kind !== 'loop' || resolved.buffers.length === 0) continue;
    if (!best || loopCycleSeconds(resolved) > loopCycleSeconds(best)) best = resolved;
  }
  return best;
};

const renderWindowSeconds = (layers: ResolvedLayer[]): number => {
  const dominant = dominantLoopLayer(layers);
  const raw = dominant ? loopCycleSeconds(dominant) : layers.reduce((max, l) => Math.max(max, spanSeconds(l)), 0);
  return Math.min(MAX_RENDER_SECONDS, Math.max(0, raw));
};

/** Pairs every layer of a track with its decoded buffers, dropping layers left with nothing. */
const resolveLayers = (track: MsuTrackDef, files: Map<string, AudioBuffer>): ResolvedLayer[] => {
  const out: ResolvedLayer[] = [];
  for (const [index, layer] of track.layers.entries()) {
    const buffers = layer.files.map((name) => files.get(name)).filter((b): b is AudioBuffer => !!b);
    if (buffers.length > 0) out.push({ layer, index, buffers });
  }
  return out;
};

export {
  MAX_RENDER_SECONDS, resolveLayers, renderWindowSeconds, dominantLoopLayer,
  loopCycleSeconds, spanSeconds, intervalPoints,
  loopCrossfadeSeconds, crossfadeWindowSeconds,
};
export type { ResolvedLayer };
