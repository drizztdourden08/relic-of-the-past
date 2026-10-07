/* @layer renderer-components @kind logic */
/**
 * A grid's track list, as list edits.
 *
 * The edits are here instead of in the component because they are the part
 * that has to be right: a track list is the one thing in this section a
 * document can be structurally wrong about (`columns` may never be empty), and
 * "add, remove, reorder" is testable against a real document without rendering
 * anything.
 *
 * `trackWeight` IS A GAUGE, NOT GEOMETRY (§48, and §50 narrowed it further).
 * The lattice takes its proportions from the engine's own solve now
 * (`lattice-geometry.ts`), so this weight sizes nothing a pointer aims at.
 *
 * THE FOUR MODES LIVE HERE, NOT IN A COMPONENT (§55). `ExtentField` owned the
 * table while it was the only control that offered them; the selected track's
 * own header offers the same four now (`TrackHead`), so a second copy would be
 * two menus drifting apart over the one vocabulary an extent has.
 */
import type { Extent } from '@shared/types/hud';

/** The four ways an axis can be sized. */
type ExtentMode = 'auto' | 'fill' | 'px' | 'pct';

const EXTENT_MODES: readonly { mode: ExtentMode; label: string; suffix: string }[] = [
  { mode: 'auto', label: 'auto (as big as what is in it)', suffix: 'auto' },
  { mode: 'fill', label: 'fill (the rest of the main axis)', suffix: 'fill' },
  { mode: 'px', label: 'px (game pixels)', suffix: 'px' },
  { mode: 'pct', label: '% (of the parent)', suffix: '%' },
];

/** A bare expression is `px` shorthand (`hud-node.ts`'s own note). */
const modeOf = (value: Extent | undefined): ExtentMode => {
  if (value === undefined || value === 'auto') return 'auto';
  if (value === 'fill') return 'fill';
  return 'pct' in value ? 'pct' : 'px';
};

/** A bound extent has no literal to carry across a mode change. `ValueField`
 *  is where an expression gets a real editor, so this reads it as 0. */
const numberOf = (value: Extent | undefined): number => {
  if (typeof value !== 'object') return 0;
  const raw = 'pct' in value ? value.pct : 'px' in value ? value.px : undefined;
  return typeof raw === 'number' ? raw : 0;
};

/** The extent a mode means, keeping whatever number the old one carried. */
const extentFor = (mode: ExtentMode, from: Extent | undefined): Extent => {
  if (mode === 'auto') return 'auto';
  if (mode === 'fill') return 'fill';
  const n = numberOf(from);
  return mode === 'px' ? { px: n } : { pct: n };
};

/** What a chip says. A data-bound track has no literal to print, so it says
 *  what it is with the same `ƒx` mark `ValueInput` uses for a formula. */
const trackText = (extent: Extent): string => {
  if (extent === 'auto' || extent === 'fill') return extent;
  if ('from' in extent) return 'ƒx';
  const raw = 'pct' in extent ? extent.pct : extent.px;
  if (typeof raw !== 'number') return 'ƒx';
  return 'pct' in extent ? `${raw}%` : `${raw}px`;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** A track's share of the miniature. `fill` takes the leftovers so it draws
 *  wider than `auto`; the two measured modes scale off numbers an author
 *  actually types (16 game px and 25% both land on 1). */
const trackWeight = (extent: Extent): number => {
  if (extent === 'auto') return 1;
  if (extent === 'fill') return 2;
  if ('from' in extent) return 1;
  const raw = 'pct' in extent ? extent.pct : extent.px;
  if (typeof raw !== 'number') return 1;
  return clamp('pct' in extent ? raw / 25 : raw / 16, 0.4, 4);
};

const setTrack = (tracks: readonly Extent[], index: number, next: Extent | undefined): Extent[] =>
  tracks.map((track, at) => (at === index ? (next ?? 'auto') : track));

/** One extent applied to a whole selected range. §48's header selection edits
 *  every track it named, not just the anchor. */
const setTrackRange = (tracks: readonly Extent[], indices: readonly number[], next: Extent | undefined): Extent[] =>
  tracks.map((track, at) => (indices.includes(at) ? (next ?? 'auto') : track));

/** New tracks land AFTER the one they were added from, which is where the
 *  strip's `+` sits and what "insert here" means when reading left to right. */
const insertTrack = (tracks: readonly Extent[], index: number): Extent[] => {
  const next = [...tracks];
  next.splice(index + 1, 0, 'auto');
  return next;
};

const insertTrackBefore = (tracks: readonly Extent[], index: number): Extent[] => {
  const next = [...tracks];
  next.splice(Math.max(0, index), 0, 'auto');
  return next;
};

const removeTrack = (tracks: readonly Extent[], index: number): Extent[] =>
  tracks.filter((_unused, at) => at !== index);

const removeTrackRange = (tracks: readonly Extent[], indices: readonly number[]): Extent[] =>
  tracks.filter((_unused, at) => !indices.includes(at));

/** Reorder by one place. Out-of-range moves are refused instead of clamped,
 *  so a button that should be disabled cannot silently no-op into a swap. */
const moveTrack = (tracks: readonly Extent[], index: number, by: number): Extent[] => {
  const to = index + by;
  if (to < 0 || to >= tracks.length) return [...tracks];
  const next = [...tracks];
  const [moved] = next.splice(index, 1);
  next.splice(to, 0, moved);
  return next;
};

export {
  EXTENT_MODES, extentFor, insertTrack, insertTrackBefore, modeOf, moveTrack,
  numberOf, removeTrack, removeTrackRange, setTrack, setTrackRange, trackText, trackWeight,
};
export type { ExtentMode };
