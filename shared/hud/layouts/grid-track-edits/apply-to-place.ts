/* @layer shared-hud @kind logic */
import type { AxisPlace, TrackEdit } from './grid-track-edits.type';

const removeAt = (place: AxisPlace, index: number): AxisPlace => {
  const first = place.start - 1;
  const last = first + place.span - 1;
  if (index > last) return place;
  if (index < first) return { start: place.start - 1, span: place.span };
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

export { applyToPlace };
