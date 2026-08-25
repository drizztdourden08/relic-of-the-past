/* @layer renderer-components @kind types */

interface IntervalTimesProps {
  /** Offsets in seconds from the moment the slot started. */
  atSeconds: number[];
  disabled?: boolean;
  onChange: (atSeconds: number[]) => void;
}

export type { IntervalTimesProps };
