/* @layer renderer-components @kind types */

/** A named group of quick-assign swatches. One origin per group, never mixed. */
interface SwatchGroup {
  /** The origin, shown as the group's heading. "Green palette" and "Gloves" are typical. */
  label: string;
  /** Hex colours in that origin's own order. */
  colors: readonly string[];
}

interface ColorPickerProps {
  /** Current colour, `#rrggbb`. Alpha lives in `alpha` below. */
  value: string;
  /** Fires on every drag step, so callers should treat it as continuous. */
  onChange: (hex: string) => void;
  /** Current alpha, 0-1. Omit (or set `disableAlpha`) for a caller with no alpha channel. */
  alpha?: number;
  onAlphaChange?: (alpha: number) => void;
  /** Hides the alpha slider entirely, for a colour space that has no alpha. */
  disableAlpha?: boolean;
  /** Heading naming the slot being edited. */
  title?: string;
  /** The value this slot started at, shown as a reference and a reset target. */
  original?: string;
  /** Hardware word behind `value`, shown so the real stored value is visible. */
  word?: number;
  /** True when `value` had to be quantised to the hardware grid. */
  snapped?: boolean;
  onReset?: () => void;
  onClose?: () => void;
  /** Quick-assign swatches, grouped by where each colour actually comes from. */
  swatchGroups?: readonly SwatchGroup[];
}

export type { ColorPickerProps, SwatchGroup };
