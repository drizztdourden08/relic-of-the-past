/* @layer shared-hud @kind logic */
import { applyToPlace } from './apply-to-place';
import { SPAN, START } from './grid-track-edits.constants';
import type { HudNode, HudPlace } from '../../../types/hud';
import type { AxisPlace, TrackEdit } from './grid-track-edits.type';

const fit = (place: AxisPlace, count: number): AxisPlace => {
  const span = Math.max(1, Math.min(place.span, count));
  const start = Math.max(1, Math.min(place.start, count - span + 1));
  return { start, span };
};

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

export { childAfter };
