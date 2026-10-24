/* @layer renderer-components @kind component */
import { Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { slotNameError } from '@rotp/randomizer';
import type { SlotNameFieldProps } from './SlotNameField.type';

const SlotNameField = ({ value, onChange, disabled }: SlotNameFieldProps) => (
  <Field label="Slot name" error={slotNameError(value) ?? undefined}>
    <TextInput type="text" value={value} spellCheck={false} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

export { SlotNameField };
