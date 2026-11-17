/* @layer renderer-components @kind component */
import { Field, Select, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { setOptionLabel } from '../../../behavior/set-option-label';
import type { DetailsStepProps } from '../DetailsStep.type';

const SetFields = ({ values, update, baseSets }: DetailsStepProps) => (
  <Stack gap="md">
    <Field label={values.source === 'copy' ? 'Copy of' : 'Based on'}>
      <Select
        value={values.baseSet}
        onChange={(baseSet) => update({ baseSet })}
        options={baseSets.map((set) => ({ value: set.id, label: setOptionLabel(set) }))}
        placeholder="Pick a set..."
      />
    </Field>
    <Field label="Name" hint="The set id is made from the name">
      <TextInput value={values.name} onChange={(e) => update({ name: e.currentTarget.value })} placeholder="Canon names" />
    </Field>
  </Stack>
);

export { SetFields };
