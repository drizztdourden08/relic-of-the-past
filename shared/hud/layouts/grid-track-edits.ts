/* @layer shared-hud @kind logic */
/**
 * A TRACK EDIT IS A DOCUMENT RULE, NOT A PANEL RULE (§50). Adding, inserting,
 * removing or moving a column or a row changes what every child's `place`
 * MEANS, so the remap belongs beside the document's own types where the engine
 * and the validator can be pointed at it, not inside whichever control happened
 * to press the button.
 *
 * NOTHING IS EVER REFUSED BECAUSE A CHILD IS IN THE WAY. §48 guarded `remove`
 * against a track a child originated in and made the author move the child by
 * hand first; the maintainer's answer is that children are kept valid
 * automatically, so the edit happens and the children follow:
 *
 * - REMOVE: children after the track shift one index toward it; a child whose
 *   ORIGIN was in it lands on the nearest surviving track (the one BEFORE when
 *   there is one, else the one after); a span that covered it shrinks by one.
 * - INSERT: children at or after the insertion point shift one away; a span
 *   that STRADDLES the point grows by one, so the shape a reader sees is the
 *   shape that survives.
 * - MOVE: the origin rides with the track it was in and the displaced neighbour
 *   shifts accordingly, which is the permutation the track list itself
 *   performed, read backwards.
 *
 * AND THE RESULT IS ALWAYS IN RANGE. Every path finishes through `fit`, so
 * `place.column`/`place.row` is at least 1 and no span reaches past the last
 * track. `validateLayout` and `place-grid.ts` both assume that invariant and
 * neither states it.
 */
import type { Extent, HudGridContainer, HudNode, HudPlace } from '../../types/hud';

type TrackAxis = 'columns' | 'rows';

type TrackEdit =
  | { op: 'append'; axis: TrackAxis }
  /** Insert a fresh `auto` track AT this 0-based index, pushing it and everything after it away. */
  | { op: 'insert'; axis: TrackAxis; index: number }
  | { op: 'remove'; axis: TrackAxis; index: number }
  | { op: 'move'; axis: TrackAxis; from: number; to: number }
  /** One extent written over a whole selected range. It is the only edit children never feel. */
  | { op: 'size'; axis: TrackAxis; indices: readonly number[]; extent: Extent };

interface AxisPlace { start: number; span: number }

const START: Record<TrackAxis, 'column' | 'row'> = { columns: 'column', rows: 'row' };
const SPAN: Record<TrackAxis, 'colSpan' | 'rowSpan'> = { columns: 'colSpan', rows: 'rowSpan' };

const clampIndex = (index: number, length: number): number =>
  Math.min(Math.max(Math.trunc(index), 0), Math.max(0, length));

/** How far a child actually reaches on one axis, so an implicit row an author
 *  can see in the lattice is a real track before it is edited. */
const reachOn = (children: readonly HudNode[], axis: TrackAxis): number => children.reduce(
  (most, child) => {
    const place = child.place;
    if (!place) return most;
    const start = place[START[axis]] ?? 1;
    const span = place[SPAN[axis]] ?? 1;
    return Math.max(most, start + span - 1);
  },
  0,
);

/** The axis as a real list. `rows` may be omitted (implicit `auto` rows), and an
 *  edit to a row nobody declared still has to mean something, so the list is
 *  materialised out to what the children already reach before anything moves. */
const tracksOn = (container: HudGridContainer, axis: TrackAxis): Extent[] => {
  const declared = axis === 'columns' ? container.columns : (container.rows ?? []);
  const need = Math.max(declared.length, reachOn(container.children, axis), 1);
  return [...declared, ...Array.from({ length: need - declared.length }, () => 'auto' as Extent)];
};

const fit = (place: AxisPlace, count: number): AxisPlace => {
  const span = Math.max(1, Math.min(place.span, count));
  const start = Math.max(1, Math.min(place.start, count - span + 1));
  return { start, span };
};

const removeAt = (place: AxisPlace, index: number): AxisPlace => {
  const first = place.start - 1;
  const last = first + place.span - 1;
  if (index > last) return place;
  if (index < first) return { start: place.start - 1, span: place.span };
  // The track itself is going: a span that covered it shrinks, and an origin
  // standing in it steps BACK onto the track before, which a reader's eye is
  // already on, and falls forward only when there is nothing before it.
  if (place.span > 1) return { start: place.start - (index < first ? 1 : 0), span: place.span - 1 };
  return { start: Math.max(1, place.start - 1), span: 1 };
};

const insertAt = (place: AxisPlace, index: number): AxisPlace => {
  const first = place.start - 1;
  const last = first + place.span - 1;
  if (index <= first) return { start: place.start + 1, span: place.span };
  if (index <= last) return { start: place.start, span: place.span + 1 };
  return place;
};

/** The track list's own permutation, read backwards: whichever index a track
 *  ended up at is where the children standing in it end up too. */
const moveAt = (place: AxisPlace, from: number, to: number): AxisPlace => {
  const origin = place.start - 1;
  if (origin === from) return { start: to + 1, span: place.span };
  if (from < origin && origin <= to) return { start: place.start - 1, span: place.span };
  if (to <= origin && origin < from) return { start: place.start + 1, span: place.span };
  return place;
};

const applyToPlace = (place: AxisPlace, edit: TrackEdit): AxisPlace => {
  switch (edit.op) {
    case 'remove': return removeAt(place, edit.index);
    case 'insert': return insertAt(place, edit.index);
    case 'move': return moveAt(place, edit.from, edit.to);
    default: return place;
  }
};

/** The track list after the edit. This is the half a reader can check by eye. */
const editTracks = (tracks: readonly Extent[], edit: TrackEdit): Extent[] => {
  const next = [...tracks];
  switch (edit.op) {
    case 'append':
      next.push('auto');
      return next;
    case 'insert':
      next.splice(clampIndex(edit.index, next.length), 0, 'auto');
      return next;
    case 'remove':
      if (edit.index < 0 || edit.index >= next.length) return next;
      next.splice(edit.index, 1);
      return next;
    case 'move': {
      if (edit.from < 0 || edit.from >= next.length || edit.to < 0 || edit.to >= next.length) return next;
      const [moved] = next.splice(edit.from, 1);
      next.splice(edit.to, 0, moved);
      return next;
    }
    default:
      return next.map((track, at) => (edit.indices.includes(at) ? edit.extent : track));
  }
};

/** A `place` with every `undefined` key dropped, because `{ colSpan: undefined }` is
 *  not what a document says when a span is gone, and a validator that walks keys
 *  would see one. */
const tidy = (place: HudPlace): HudPlace | undefined => {
  const out = Object.fromEntries(Object.entries(place).filter(([, v]) => v !== undefined)) as HudPlace;
  return Object.keys(out).length > 0 ? out : undefined;
};

const childAfter = (child: HudNode, edit: TrackEdit, count: number): HudNode => {
  const place = child.place;
  if (!place) return child;
  const { axis } = edit;
  const before: AxisPlace = { start: place[START[axis]] ?? 1, span: place[SPAN[axis]] ?? 1 };
  const after = fit(applyToPlace(before, edit), count);
  const next = tidy({
    ...place,
    [START[axis]]: after.start,
    [SPAN[axis]]: after.span > 1 ? after.span : undefined,
  });
  if (next === undefined) {
    const { place: _dropped, ...rest } = child;
    return rest as HudNode;
  }
  return { ...child, place: next };
};

/**
 * ONE FUNCTION, the whole rule. Hand it a grid and a track edit; take back the
 * grid with its tracks edited AND every child's `place` still meaning the cell
 * the author was looking at. `columns` never empties, which is the one structural
 * floor `validate-container.ts` states, and a `remove` that would empty it is a
 * no-op instead of a document the validator rejects.
 */
const editGridTracks = (container: HudGridContainer, edit: TrackEdit): HudGridContainer => {
  const tracks = tracksOn(container, edit.axis);
  if (edit.op === 'remove' && edit.axis === 'columns' && tracks.length <= 1) return container;
  const next = editTracks(tracks, edit);
  const count = Math.max(1, next.length);
  // `append` and `size` only ever grow or re-measure a track, so no address
  // changes meaning and the children are handed back untouched.
  const children = (edit.op === 'append' || edit.op === 'size')
    ? container.children
    : container.children.map((child) => childAfter(child, edit, count));
  return edit.axis === 'columns'
    ? { ...container, columns: next, children }
    : { ...container, rows: next.length > 0 ? next : undefined, children };
};

export { editGridTracks, reachOn, tracksOn };
export type { TrackAxis, TrackEdit };
