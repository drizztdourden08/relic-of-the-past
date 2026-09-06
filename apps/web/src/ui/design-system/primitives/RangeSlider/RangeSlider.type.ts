/* @layer renderer-components @kind types */
interface RangeSliderProps {
  /** The discrete stops, in order; both thumbs sit on indexes into this list. */
  stops: readonly string[];
  /** [low, high] indexes into `stops`; the thumbs never cross. */
  value: readonly [number, number];
  onChange: (next: [number, number]) => void;
  disabled?: boolean;
  /** Keyboard step in stops (default 1) — a long ladder moves in coarser strides. */
  step?: number;
  /** Show a tick label every N stops; the first and last stop are always labelled. */
  labelEvery?: number;
  ariaLabel?: string;
  className?: string;
}

export type { RangeSliderProps };
