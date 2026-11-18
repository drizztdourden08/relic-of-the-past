/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { RadioGroup } from '@drizztdourden08/tessera/primitives';
import { sourceOptions } from '../MsuCreateWizard.constants';
import type { FieldsProps } from '../MsuCreateWizard.type';

const SourceStep = ({ values, update }: FieldsProps) => {
  const t = useT();
  return (
  <RadioGroup
    label={t('wizards:msu.source-step.where-the-pack-comes-from')}
    direction="vertical"
    value={values.source}
    options={[...sourceOptions(t)]}
    onChange={(source) => update({ source })}
  />
  );
};

export { SourceStep };
