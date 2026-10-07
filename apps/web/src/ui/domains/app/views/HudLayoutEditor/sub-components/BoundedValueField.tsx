/* @layer renderer-components @kind component */
/**
 * A SCALAR WITH A KNOWN RANGE, drawn as its range.
 *
 * `fill (0-1)`, `armor (0-2)` and `bands (1 or 2)` are three fields whose bounds
 * were written into their LABELS and enforced nowhere the eye could see. A
 * spinner with the range in its caption asks the author to hold the range in
 * their head while they type into a box that will accept anything; the plan's
 * own verdict is that the design system's `Slider` has existed the whole time
 * and the inspector has never once imported it.
 *
 * THE SLIDER IS THE SECOND HALF OF THE FIELD, NOT THE FIELD. `ValueInput` is
 * still there and still always typed, because a bounded scalar is exactly as
 * bindable as an unbounded one. `= item` is the commonest thing anyone writes
 * into `fill`. And 0.35 is a number a slider cannot be trusted to
 * land on. Type it, or drag it.
 *
 * A FORMULA HAS NO HANDLE, SO IT IS NOT GIVEN ONE. The slider is a PREDICATE
 * over the current value, the same way `ValueInput`'s spinner is a predicate
 * over the current text: while the value is a literal number there is a track
 * to drag, and the moment it becomes `= item` the track is not there. A
 * disabled slider under a formula would be chrome asserting a mode this field
 * does not have (contract §36.2's own reasoning, one control over).
 *
 * OUT-OF-RANGE IS STILL NOT AN ERROR. `ValueInput` already says "valid, but
 * above this field's 2" for a formula that resolves past the top, and a stored
 * document with `fill: 4` still loads, still draws, and still reads back as 4.
 * The slider clamps its own HANDLE to the track (it has nowhere else to put
 * it) and the number beside it keeps saying 4.
 */
import './HudLayoutEditor.content.css';
import { Box } from '@ds/primitives/Box';
import { Slider } from '@ds/primitives/Slider';
import { ValueField } from './ValueField';
import type { Value } from '@shared/types/hud';

interface BoundedValueFieldProps {
  label: string;
  value: Value;
  onChange: (next: Value) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  min: number;
  max: number;
  step?: number;
  className?: string;
}

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

const BoundedValueField = (props: BoundedValueFieldProps) => {
  const { label, value, onChange, scope, insideRepeat, min, max, step = 1, className = '' } = props;
  const literal = typeof value === 'number' ? value : null;

  return (
    <Box className={`hud-bounded ${className}`}>
      <ValueField
        label={label}
        value={value}
        onChange={onChange}
        scope={scope}
        insideRepeat={insideRepeat}
        min={min}
        max={max}
        step={step}
      />
      {literal !== null && (
        <Box className="hud-bounded__slider">
          <Slider
            value={clamp(literal, min, max)}
            min={min}
            max={max}
            step={step}
            showValue={false}
            onChange={onChange}
          />
        </Box>
      )}
    </Box>
  );
};

export { BoundedValueField };
export type { BoundedValueFieldProps };
