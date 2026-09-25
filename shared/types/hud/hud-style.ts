/* @layer shared-types @kind types */
/**
 * The box grows a face: every CSS-grade decoration a node's box may carry.
 * `phase 4 of plans/hud-data-binding.html ("Styling: the box grows a face").
 *
 * Every numeric field is a `Value` - a border width or a shadow's blur reads
 * from the data scope exactly the way `size` or `opacity` already do. Colour
 * fields are `Paint` (`hud-value.ts`): a flat colour, a gradient, or an image.
 *
 * OUTLINE IS NOT A BORDER. A border traces the BOX; `outline` traces the INK of
 * whatever the node draws - a ring around a transparent sprite's own silhouette,
 * which a CSS border cannot do because a border does not know where the alpha
 * is. It is drawn as stacked filters and its width is capped; see the renderer
 * for the number and why.
 *
 * `guide` is NOT here - it lives on `HudContainerBase` (`hud-node.ts`, §57)
 * because it is a statement about a container's own overlay colour, never about
 * a box's face, and it is editor-only metadata the game must never draw.
 */

import type { Paint, Value } from './hud-value';

interface HudBorderSides { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean }

type HudBorderStyle = 'solid' | 'dashed' | 'dotted';

interface HudBorder {
  width: Value;
  color: Paint;
  style?: HudBorderStyle;
  /** Absent = every side. */
  sides?: HudBorderSides;
}

/** One value for all four corners, or one per corner: top-left, top-right,
 *  bottom-right, bottom-left - the CSS `border-radius` shorthand order. */
type HudRadius = Value | [Value, Value, Value, Value];

interface HudShadow {
  x: Value;
  y: Value;
  blur: Value;
  spread?: Value;
  color: Paint;
  inset?: boolean;
}

/** A ring around the node's own INK, not its box. See the file header. */
interface HudOutline {
  width: Value;
  color: Paint;
}

type HudTintMode = 'multiply' | 'replace';

interface HudTint {
  color: Paint;
  /** Default 'multiply'. */
  mode?: HudTintMode;
  /** 0-1, how much of the tint lands. Default 1. */
  amount?: Value;
}

interface HudBoxStyle {
  background?: Paint;
  border?: HudBorder;
  radius?: HudRadius;
  shadow?: HudShadow[];
  outline?: HudOutline;
  tint?: HudTint;
  /** Default false. Clips this node's own children to its box. */
  clip?: boolean;
}

export type {
  HudBorder, HudBorderSides, HudBorderStyle, HudBoxStyle, HudOutline, HudRadius, HudShadow, HudTint, HudTintMode,
};
