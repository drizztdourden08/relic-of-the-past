/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, Select, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { setOptionLabel } from '../../../behavior/set-option-label';
import type { DetailsStepProps } from '../DetailsStep.type';

const SetFields = ({ values, update, baseSets }: DetailsStepProps) => {
  const t = useT();
  return (
  <Stack gap="md">
    <Field label={values.source === 'copy' ? t('wizards:language.review.copy-of') : t('wizards:language.review.based-on')}>
      <Select
        value={values.baseSet}
        onChange={(baseSet) => update({ baseSet })}
        options={baseSets.map((set) => ({ value: set.id, label: setOptionLabel(set) }))}
        placeholder={t('wizards:language.details.pick-a-set')}
      />
    </Field>
    <Field label={t('wizards:language.details.name')} hint={t('wizards:language.details.the-set-id-is-made')}>
      <TextInput value={values.name} onChange={(e) => update({ name: e.currentTarget.value })} placeholder={t('wizards:language.details.canon-names')} />
    </Field>
  </Stack>
  );
};

export { SetFields };
