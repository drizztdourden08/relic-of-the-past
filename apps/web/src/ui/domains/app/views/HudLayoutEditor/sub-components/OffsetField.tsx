/* @layer renderer-components @kind component */
/**
 * WHERE THIS IS, AND HOW TO MOVE IT. The panel could not answer that question
 * at all before this control existed.
 *
 * Two numbers, negatives allowed, wired to `margin.left` / `margin.top`
 * (`behavior/offset.ts` owns that decision and both writers of it). Under a
 * flex or a grid parent they displace the node from wherever the flow put it;
 * on a region root they nudge the region away from its anchor, which is the
 * same arithmetic one level up (`engine/anchor-rect.ts`).
 *
 * `PositionInput` IS THE PRIMITIVE, not a pair of spinners dressed as one. Its
 * own header says a bounded two-axis pair belongs to a caller like this, and
 * its shell, its caps and its draft rules (a half-typed `-` survives, a
 * commit never emits NaN) are the ones the rest of the app already uses. The
 * only thing this adds is the meaning: which two document keys, and what the
 * numbers are measured from.
 *
 * THE LABEL IS THE CONTRACT. "offset" alone would read as absolute screen
 * position, which this is not and cannot be, because nothing below a region root ever
 * sees the view. The hint carries the rest of the plan's own sentence, because
 * a label long enough to say it wraps to two lines at the 188 px rail.
 */
import { Field } from '@ds/primitives/Field';
import { PositionInput } from '@ds/primitives/PositionInput';
import { offsetOf, withOffset } from '../behavior/offset';
import type { Edges } from '@shared/types/hud';

const AXES = { x: { label: 'x' }, y: { label: 'y' } } as const;

interface OffsetFieldProps {
  /** The whole margin: this control owns two of its four edges. */
  value: Edges | undefined;
  onChange: (next: Edges | undefined) => void;
  /** Names the frame the two numbers are measured from. */
  from?: string;
}

const OffsetField = (props: OffsetFieldProps) => {
  const { value, onChange, from = 'where the parent puts it' } = props;

  return (
    <Field
      size="sm"
      label="offset"
      hint={`from ${from}. Dragging on the stage writes the same two numbers`}
      className="hud-offset"
    >
      {/* No `label` prop: `PositionInput` would draw a SECOND caption above the
       *  axes, and the row's one label is the `Field`'s. Each axis is already
       *  named by its own cap, which the primitive renders inside the
       *  `<label>` that wraps the input. */}
      <PositionInput
        size="sm"
        value={offsetOf(value)}
        x={AXES.x}
        y={AXES.y}
        onChange={(next) => onChange(withOffset(value, next))}
      />
    </Field>
  );
};

export { OffsetField };
export type { OffsetFieldProps };
