/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { offsetOf, withOffset } from '@app/hud-layout-editing/offset';
import { OFFSET_PATTERN } from './OffsetField.constants';
import type { PatternSlotValue, PatternValue } from '@drizztdourden08/tessera/composites';
import type { OffsetFieldProps } from './OffsetField.type';

const numberOf = (slot: PatternSlotValue | undefined): number => (typeof slot === 'number' ? slot : 0);

const OffsetField = (props: OffsetFieldProps) => {
  const { value, onChange, from = 'where the parent puts it' } = props;
  const slots: PatternValue = { ...offsetOf(value) };

  return (
    <Field
      size="sm"
      label="offset"
      hint={`from ${from}. Dragging on the stage writes the same two numbers`}
      className="hud-offset"
    >
      <DynamicInput
        size="sm"
        aria-label="offset"
        pattern={OFFSET_PATTERN}
        value={slots}
        onChange={(next) => onChange(withOffset(value, { x: numberOf(next.x), y: numberOf(next.y) }))}
      />
    </Field>
  );
};

export { OffsetField };
export type { OffsetFieldProps } from './OffsetField.type';
