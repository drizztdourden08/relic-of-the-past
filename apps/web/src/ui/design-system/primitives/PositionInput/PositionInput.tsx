/* @layer renderer-components @kind component */
/**
 * A two-axis position, edited as one control.
 *
 * The pair is bounded by the caller: each axis takes its own floor, ceiling and
 * step, and nothing here assumes what a coordinate means — a tile on a grid, a
 * corner of a rectangle, an offset in pixels are all the same two numbers with
 * different limits. Bounds are enforced, not decorative: onChange is never
 * called with NaN or with a value outside the range the caller declared.
 *
 * Scoped to the pair on purpose. A position-plus-size rectangle is four numbers,
 * but the extra two are extents rather than coordinates — they carry a different
 * floor (an empty rectangle is usually meaningless), they want a two-by-two
 * layout rather than a row, and they bring a cross-field rule this control
 * deliberately does not have: the far edge has to stay inside the same space the
 * near corner is bounded by. A sibling built on the same AxisField and the same
 * clamp helpers is the honest way to cover that, not a fourth optional axis here.
 */
import './PositionInput.css';
import { useCallback } from 'react';
import { AxisField } from './sub-components/AxisField';
import type { PositionAxis, PositionInputProps } from './PositionInput.type';

/** Stable identity for an axis the caller left open, so handlers stay memoised. */
const OPEN_AXIS: PositionAxis = {};

const DEFAULT_X_LABEL = 'X';
const DEFAULT_Y_LABEL = 'Y';

const PositionInput = (props: PositionInputProps) => {
  const { value, onChange, x = OPEN_AXIS, y = OPEN_AXIS, disabled = false, label, className = '' } = props;

  const commitX = useCallback((next: number) => onChange({ ...value, x: next }), [onChange, value]);
  const commitY = useCallback((next: number) => onChange({ ...value, y: next }), [onChange, value]);

  const classes = [
    'position-input',
    disabled ? 'position-input--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group" aria-label={label}>
      {label != null && <span className="position-input__label">{label}</span>}
      <div className="position-input__axes">
        <AxisField
          axis={x}
          axisLabel={x.label ?? DEFAULT_X_LABEL}
          value={value.x}
          disabled={disabled}
          onCommit={commitX}
        />
        <AxisField
          axis={y}
          axisLabel={y.label ?? DEFAULT_Y_LABEL}
          value={value.y}
          disabled={disabled}
          onCommit={commitY}
        />
      </div>
    </div>
  );
};

export { PositionInput };
