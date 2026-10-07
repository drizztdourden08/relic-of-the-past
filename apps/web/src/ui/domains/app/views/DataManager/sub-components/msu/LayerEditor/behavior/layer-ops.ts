/* @layer renderer-components @kind logic */
/**
 * The pure edits behind the layer editor, kept out of the hook so each one can be read on its own.
 *
 * A layer's `id` is generated once, at creation, and never rewritten. The resume snapshot in a
 * save file is keyed by it, so a regenerated id would silently drop that layer's position and
 * restart it from the top on load.
 *
 * The optional scheduling fields are held explicitly while editing (a control cannot render
 * `undefined`) and dropped again on the way out when they carry their default, so a pack that
 * uses neither crossfade nor wait-for-completion is written exactly as an older studio wrote it.
 */
import type { LayerPlayMode, MsuLayer } from '@shared/types/msu-manifest';
import { MAX_CROSSFADE_SECONDS } from '@shared/types/msu-manifest';
import { newId } from '@shared/storage/id';

type PlayModeKind = LayerPlayMode['kind'];

/** No overlap: one pass cuts straight to the next, which is what a lone looping file wants. */
const DEFAULT_CROSSFADE_SECONDS = 0;
/** Gap timed from the sound's start, so a long sound overlaps the next. The historical default. */
const DEFAULT_WAIT_FOR_COMPLETION = false;

const DEFAULT_MODES: Record<PlayModeKind, LayerPlayMode> = {
  once: { kind: 'once' },
  loop: { kind: 'loop', order: 'sequential', crossfadeSeconds: DEFAULT_CROSSFADE_SECONDS },
  random: {
    kind: 'random',
    minDelaySeconds: 10,
    maxDelaySeconds: 30,
    waitForCompletion: DEFAULT_WAIT_FOR_COMPLETION,
  },
  interval: { kind: 'interval', atSeconds: [] },
};

const MODE_LABELS: Record<PlayModeKind, string> = {
  once: 'Once', loop: 'Loop', random: 'Random', interval: 'Interval',
};

/**
 * A new layer, in the mode its channel can actually end in. An effect channel gets `once`: it is
 * fired at a moment and is over, and a loop there would still be playing long after that moment.
 */
const createLayer = (existing: MsuLayer[], oneShot = false): MsuLayer => ({
  id: newId(),
  name: `Layer ${existing.length + 1}`,
  files: [],
  mode: oneShot ? DEFAULT_MODES.once : DEFAULT_MODES.loop,
  volume: 100,
});

const moveItem = <T,>(items: T[], index: number, delta: number): T[] => {
  const target = index + delta;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

/** An absent crossfade is legal (it means "off"); a present one has to be a real 0-10 duration. */
const isLegalCrossfade = (seconds: number | undefined): boolean =>
  seconds === undefined
  || (Number.isFinite(seconds) && seconds >= 0 && seconds <= MAX_CROSSFADE_SECONDS);

/** The first reason these layers could not play, phrased for the editor's error line. */
const validateLayers = (layers: MsuLayer[]): string | null => {
  for (const layer of layers) {
    const label = layer.name.trim() || 'A layer';
    if (layer.files.length === 0) return `${label} has no audio files.`;
    if (layer.mode.kind === 'loop' && !isLegalCrossfade(layer.mode.crossfadeSeconds)) {
      return `${label}: the crossfade must be between 0 and ${MAX_CROSSFADE_SECONDS} seconds.`;
    }
    if (layer.mode.kind === 'random' && layer.mode.minDelaySeconds > layer.mode.maxDelaySeconds) {
      return `${label}: the shortest gap cannot be longer than the longest.`;
    }
    if (layer.mode.kind === 'interval' && layer.mode.atSeconds.length === 0) {
      return `${label}: an interval layer needs at least one time.`;
    }
  }
  return null;
};

const clampCrossfade = (seconds: number | undefined): number => {
  if (seconds === undefined || !Number.isFinite(seconds)) return DEFAULT_CROSSFADE_SECONDS;
  return Math.max(0, Math.min(MAX_CROSSFADE_SECONDS, seconds));
};

/** Strips the optional fields at their default, and clamps a crossfade a hand-edit put out of range. */
const normalizeMode = (mode: LayerPlayMode): LayerPlayMode => {
  if (mode.kind === 'loop') {
    const crossfadeSeconds = clampCrossfade(mode.crossfadeSeconds);
    const { kind, order } = mode;
    return crossfadeSeconds > DEFAULT_CROSSFADE_SECONDS
      ? { kind, order, crossfadeSeconds }
      : { kind, order };
  }
  if (mode.kind === 'random') {
    const { kind, minDelaySeconds, maxDelaySeconds } = mode;
    return mode.waitForCompletion === true
      ? { kind, minDelaySeconds, maxDelaySeconds, waitForCompletion: true }
      : { kind, minDelaySeconds, maxDelaySeconds };
  }
  return mode;
};

const normalizeLayers = (layers: MsuLayer[]): MsuLayer[] =>
  layers.map((layer) => ({ ...layer, mode: normalizeMode(layer.mode) }));

export {
  DEFAULT_MODES, MODE_LABELS, createLayer, moveItem, validateLayers, normalizeLayers,
};
export type { PlayModeKind };
