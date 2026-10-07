/* @layer renderer-components @kind logic */
/**
 * The arithmetic behind `KeyframeTrack`, kept out of the component so the two
 * rules that actually matter can be proven without a browser: a key never
 * crosses its neighbour, and adding a key does not change the curve.
 *
 * KEYS CANNOT CROSS. `sampleKeyframes` sorts by `at` on every sample, so two
 * keys swapping order is worse than a crash. The diamond under the
 * pointer stops being the key being dragged, and the value row underneath
 * silently starts editing a different point. The drag is therefore clamped
 * against the two keys either side of it IN TRACK ORDER, with a gap of
 * `MIN_GAP` so they cannot land on top of each other either (a zero-width span
 * is a division `sampleKeyframes` guards but nobody can author on purpose).
 *
 * ADDING A KEY SAMPLES THE CURVE IT LANDS ON. Clicking the track at 0.4 makes
 * a key whose value IS what the animation was already doing at 0.4, so the shape
 * is unchanged until the value row is touched. The alternative (a new key at
 * some default) redraws the curve the moment you try to add a control point
 * to it, which is not what any motion tool does.
 *
 * `at` IS ROUNDED TO 2 DECIMALS. A pointer on a 200 px rail resolves finer
 * than that, and `0.41500000000000004` in a saved document is noise.
 */
import { sampleKeyframes } from '@shared/hud/engine';
import type { HudAnimationKeyframe, HudEasing } from '@shared/types/hud';

type Scope = Readonly<Record<string, number>>;

/** The closest two keys may sit. Two coincident keys make a zero-width span. */
const MIN_GAP = 0.01;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Indices, in track order. Ties keep their authored order, so a stable sort
 *  is required. `Array.prototype.sort` has been one since ES2019. */
const trackOrder = (keyframes: readonly HudAnimationKeyframe[]): number[] =>
  keyframes.map((_unused, i) => i).sort((a, b) => keyframes[a].at - keyframes[b].at);

/**
 * Where key `index` is allowed to land if the pointer asks for `at`. It stays inside
 * 0-1 and at least `MIN_GAP` clear of the key before and after it in track
 * order. A crowded track (more keys than gaps) collapses to the upper bound
 * instead of jumping past it.
 */
const clampAt = (keyframes: readonly HudAnimationKeyframe[], index: number, at: number): number => {
  const order = trackOrder(keyframes);
  const pos = order.indexOf(index);
  if (pos < 0) return clamp01(round2(at));
  const lower = pos > 0 ? keyframes[order[pos - 1]].at + MIN_GAP : 0;
  const upper = pos < order.length - 1 ? keyframes[order[pos + 1]].at - MIN_GAP : 1;
  return clamp01(round2(Math.min(Math.max(at, lower), Math.max(lower, upper))));
};

/** `index` moved to `at`, clamped. Every other key is returned untouched. The
 *  list keeps its authored order, because the SELECTED INDEX is an index into
 *  it and re-sorting here would move the selection out from under the rows. */
const moveKey = (
  keyframes: readonly HudAnimationKeyframe[], index: number, at: number,
): HudAnimationKeyframe[] =>
  keyframes.map((k, i) => (i === index ? { ...k, at: clampAt(keyframes, index, at) } : k));

/**
 * A new key at `at`, holding whatever the track already reads there, appended
 * so the caller can select it by the index it returns. `undefined` when `at`
 * is already occupied (within `MIN_GAP`), because a click on a diamond selects it
 * instead of stacking a second key under it.
 */
const addKeyAt = (
  keyframes: readonly HudAnimationKeyframe[], at: number, scope: Scope, easing: HudEasing | undefined,
): { keyframes: HudAnimationKeyframe[]; index: number } | undefined => {
  const target = clamp01(round2(at));
  if (keyframes.some((k) => Math.abs(k.at - target) < MIN_GAP)) return undefined;
  const value = round2(sampleKeyframes(keyframes, target, scope, easing));
  return { keyframes: [...keyframes, { at: target, value }], index: keyframes.length };
};

/** 0-1 across the rail. `width <= 0` (an unmeasured rail, in a test or during
 *  a resize) reads as 0 instead of `NaN`, which would reach the document. */
const atFromPointer = (clientX: number, rect: { left: number; width: number }): number =>
  clamp01(round2(rect.width > 0 ? (clientX - rect.left) / rect.width : 0));

/** A keyframe is removable only while more than the validator's minimum of two
 *  remain. It is answered here so the button and the handler cannot disagree. */
const canRemoveKey = (keyframes: readonly HudAnimationKeyframe[]): boolean => keyframes.length > 2;

const removeKey = (
  keyframes: readonly HudAnimationKeyframe[], index: number,
): HudAnimationKeyframe[] =>
  (canRemoveKey(keyframes) ? keyframes.filter((_unused, i) => i !== index) : [...keyframes]);

export { addKeyAt, atFromPointer, canRemoveKey, clampAt, MIN_GAP, moveKey, removeKey, round2, trackOrder };
