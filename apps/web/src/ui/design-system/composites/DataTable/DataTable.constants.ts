/* @layer renderer-components @kind constants */
/**
 * Track sizing lives here rather than in CSS because the column set is chosen
 * at runtime — the number of tracks is data, so `grid-template-columns` has to
 * be built per render. Everything else about the grid is in the stylesheet.
 */
import type { GrowFallback } from './behavior/overflow-probe';
import type { TableColumn } from '../../data/table/types';

/** No column track goes under this, whichever of the three modes sizes it. */
const TRACK_FLOOR = '8rem';

/** Wide enough to read a value, capped so one long string cannot own the row. */
const AUTO_TRACK = `minmax(${TRACK_FLOOR}, 20rem)`;

/** "Expand to available space": the same floor, but it takes the slack. */
const GROW_TRACK = `minmax(${TRACK_FLOOR}, 1fr)`;

/** The trailing cell holds the + button and absorbs any slack width. */
const TRAILING_TRACK = 'minmax(2.5rem, 1fr)';

/** …unless a column asked for that slack, in which case it keeps only its own. */
const TRAILING_MIN_TRACK = '2.5rem';

/**
 * What a grow column falls back to while there is no slack to take. The floor
 * stays in front of the measured width on purpose: it makes the fallback track
 * never NARROWER than the grow track it replaces, which is what stops the two
 * modes from taking turns undoing each other.
 */
const growFitTrack = (width: number): string => `minmax(${TRACK_FLOOR}, ${width}px)`;

/*
 * Four ways a column is sized, in the order they win: a measured or dragged
 * pixel width, a persistent fit-to-content measurement, the slack left over,
 * or the automatic track. `width`, `grow` and `fit` are mutually exclusive in
 * the state, so the order only matters for a snapshot hand-written with more
 * than one.
 *
 * Both fallbacks are RENDERING overrides, not extra modes: a column whose path
 * is in one of them is still that same grow or fit column, and drops straight
 * back to its un-fallen-back track (filling again, or the automatic range for
 * an unmeasured fit column) the moment the fallback lifts.
 */
const trackFor = (column: TableColumn, growFallback?: GrowFallback, fitFallback?: GrowFallback): string => {
  if (column.width) return `${column.width}px`;
  if (column.fit) {
    const fitted = fitFallback?.get(column.path);
    return fitted === undefined ? AUTO_TRACK : growFitTrack(fitted);
  }
  if (!column.grow) return AUTO_TRACK;
  const fitted = growFallback?.get(column.path);
  return fitted === undefined ? GROW_TRACK : growFitTrack(fitted);
};

/**
 * A growing column and the trailing cell would otherwise SHARE the slack, and
 * "expand to available space" that stops halfway is not what was asked for — so
 * the trailing cell gives it up as soon as any column wants it. It stays given
 * up under the fallback too: the column has not stopped being a grow column.
 */
const trackList = (
  columns: readonly TableColumn[],
  growFallback?: GrowFallback,
  fitFallback?: GrowFallback,
): string => {
  const trailing = columns.some((column) => column.grow) ? TRAILING_MIN_TRACK : TRAILING_TRACK;
  return [...columns.map((column) => trackFor(column, growFallback, fitFallback)), trailing].join(' ');
};

/**
 * The list as it WOULD read with one column held at a given width — what a
 * resize drag shows while it runs. Dragging a seam always produces a fixed
 * width, so the column stops taking the leftover space, or re-measuring
 * itself, at the same moment.
 */
const trackListWith = (
  columns: readonly TableColumn[],
  path: string,
  width: number,
  growFallback?: GrowFallback,
  fitFallback?: GrowFallback,
): string =>
  trackList(
    columns.map((column) => (column.path === path ? { ...column, width, grow: false, fit: false } : column)),
    growFallback,
    fitFallback,
  );

/** Shown when a group key is the empty string (an absent value). */
const ABSENT_KEY_LABEL = '—';

/**
 * How many values the drag ghost carries with the column. Enough to read as a
 * column rather than a chip, few enough that every header can keep a strip laid
 * out offscreen at all times without the table's length mattering.
 */
const GHOST_ROW_LIMIT = 6;

/** Stroked on a 16-unit grid: lid, handle, can, two ribs. */
const TRASH_ICON_PATHS: string[] = [
  'M2.5 4.5h11',
  'M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5',
  'M4.5 4.5l.6 9a1 1 0 0 0 1 .95h3.8a1 1 0 0 0 1-.95l.6-9',
  'M6.75 7.5v4',
  'M9.25 7.5v4',
];

/** Kinds whose group key IS the value, so a kit can render it as a cell would. */
const KEY_RENDERED_KINDS: readonly string[] = ['enum', 'idRef'];

export {
  ABSENT_KEY_LABEL, AUTO_TRACK, GHOST_ROW_LIMIT, GROW_TRACK, KEY_RENDERED_KINDS,
  TRACK_FLOOR, TRAILING_MIN_TRACK, TRAILING_TRACK, TRASH_ICON_PATHS,
  growFitTrack, trackFor, trackList, trackListWith,
};
