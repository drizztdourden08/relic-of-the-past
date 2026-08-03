/* @layer renderer-components @kind util */
/**
 * Where a panel sits relative to the element that opens it.
 *
 * A plain function of the anchor's rectangle: hang below it with a gap, or
 * flip above once there is more room up there. Kept apart from the anchor
 * tracker because that is what calls it again on every scroll without any of
 * this needing to know a scroll happened.
 *
 * The three numbers that make one caller's panel behave differently from
 * another's — how much headroom below is still "enough", the gap to the
 * anchor, and the narrowest the panel is allowed to get — are supplied by the
 * caller rather than hardcoded, so this one function serves every anchored
 * panel in the design system instead of each owning a near-identical copy.
 */

interface DropPanelPosition {
  top: number;
  left: number;
  width: number;
  /** The panel is anchored to the trigger's top edge and shifted up over itself. */
  dropUp: boolean;
}

interface DropPanelPositionOptions {
  /** Below this much room underneath, flipping above is worth considering. */
  roomForDropDown: number;
  /** Breathing space between the anchor and the panel. */
  gap: number;
  /** A narrow anchor still gets a readable panel. */
  minPanelWidth: number;
}

const dropPanelPositionFor = (
  rect: DOMRect,
  options: DropPanelPositionOptions,
): DropPanelPosition => {
  const { roomForDropDown, gap, minPanelWidth } = options;
  const spaceBelow = window.innerHeight - rect.bottom;
  const dropUp = spaceBelow < roomForDropDown && rect.top > spaceBelow;

  return {
    top: dropUp ? rect.top - gap : rect.bottom + gap,
    left: rect.left,
    width: Math.max(rect.width, minPanelWidth),
    dropUp,
  };
};

export { dropPanelPositionFor };
export type { DropPanelPosition, DropPanelPositionOptions };
