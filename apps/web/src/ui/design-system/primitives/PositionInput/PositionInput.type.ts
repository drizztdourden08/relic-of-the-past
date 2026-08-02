/* @layer renderer-components @kind types */

/** One bounded numeric axis of a position. Every field is optional: an axis with
 *  nothing set is simply open at both ends and steps by one. */
interface PositionAxis {
  /** Lowest value the axis accepts. Omit for an open lower end. */
  min?: number;
  /** Highest value the axis accepts. Omit for an open upper end. */
  max?: number;
  /** Increment the spinner applies. Defaults to 1 — a grid coordinate moves by whole tiles. */
  step?: number;
  /** Short cap shown beside the field. Defaults to "X" / "Y". */
  label?: string;
}

/** The pair this control edits. */
interface PositionValue {
  x: number;
  y: number;
}

interface PositionInputProps {
  value: PositionValue;
  /** Fires only with a valid pair — never NaN, never outside the bounds given. */
  onChange: (next: PositionValue) => void;
  /** Bounds for the horizontal axis. The caller supplies the real constraints. */
  x?: PositionAxis;
  /** Bounds for the vertical axis. */
  y?: PositionAxis;
  disabled?: boolean;
  /** Caption for the pair as a whole; also names the group for assistive tech. */
  label?: string;
  className?: string;
}

/** Internal — one axis of the pair, rendered by the AxisField sub-component. */
interface AxisFieldProps {
  axis: PositionAxis;
  axisLabel: string;
  value: number;
  disabled: boolean;
  onCommit: (next: number) => void;
}

export type { PositionAxis, PositionValue, PositionInputProps, AxisFieldProps };
