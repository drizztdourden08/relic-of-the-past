/* @layer renderer-hud @kind constants */
/** Pie geometry in viewBox units. The view box is a square centred on the pie. */

/** Half the view box side. */
const VIEW_HALF = 50;
/** Radius of the dark disc behind the slices. */
const DISC_RADIUS = 40;
/** Outer radius of a slice. */
const SLICE_RADIUS = 36;
/** Radius of the dim hub drawn over the slice tips, behind whatever sits on the pie. */
const HUB_RADIUS = 22;
/** Dark outline around each slice, which also reads as the gap between two slices. */
const SLICE_STROKE = 1.5;
/** How far a slice slides away from the centre as it leaves. Stays inside the view box. */
const PUSH_DISTANCE = 10;
/** Share of the rendered size left empty between the view box edge and the disc. */
const DISC_INSET_RATIO = (VIEW_HALF - DISC_RADIUS) / (VIEW_HALF * 2);
/** Share of the rendered size the slices span. */
const SLICE_SPAN_RATIO = SLICE_RADIUS / VIEW_HALF;

export {
  VIEW_HALF, DISC_RADIUS, SLICE_RADIUS, HUB_RADIUS, SLICE_STROKE, PUSH_DISTANCE,
  DISC_INSET_RATIO, SLICE_SPAN_RATIO,
};
