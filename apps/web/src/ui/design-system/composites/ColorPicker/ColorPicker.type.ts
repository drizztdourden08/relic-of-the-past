/* @layer renderer-components @kind types */

interface ColorPickerProps {
  /** Current colour, `#rrggbb`. */
  value: string;
  /** Fires on every drag step, so callers should treat it as continuous. */
  onChange: (hex: string) => void;
  /** Heading — which slot is being edited. */
  title?: string;
  /** The value this slot started at, shown as a reference and a reset target. */
  original?: string;
  /** Hardware word behind `value`, shown so the real stored value is visible. */
  word?: number;
  /** True when `value` had to be quantised to the hardware grid. */
  snapped?: boolean;
  onReset?: () => void;
  onClose?: () => void;
}

export type { ColorPickerProps };
