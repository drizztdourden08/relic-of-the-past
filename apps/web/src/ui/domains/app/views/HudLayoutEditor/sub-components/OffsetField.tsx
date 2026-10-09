/* @layer renderer-components @kind component */
import { Field, PositionInput } from '@drizztdourden08/tessera/primitives';
import { offsetOf, withOffset } from '../behavior/offset';
import { AXES } from './OffsetField.constants';
import type { OffsetFieldProps } from './OffsetField.type';

const OffsetField = (props: OffsetFieldProps) => {
  const { value, onChange, from = 'where the parent puts it' } = props;

  return (
    <Field
      size="sm"
      label="offset"
      hint={`from ${from}. Dragging on the stage writes the same two numbers`}
      className="hud-offset"
    >
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
export type { OffsetFieldProps } from './OffsetField.type';
