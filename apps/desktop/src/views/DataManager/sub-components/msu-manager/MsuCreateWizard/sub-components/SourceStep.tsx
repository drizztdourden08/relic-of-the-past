/* @layer renderer-components @kind component */
import { RadioGroup } from '@drizztdourden08/tessera/primitives';
import { SOURCE_OPTIONS } from '../MsuCreateWizard.constants';
import type { FieldsProps } from '../MsuCreateWizard.type';

const SourceStep = ({ values, update }: FieldsProps) => (
  <RadioGroup
    label="Where the pack comes from"
    direction="vertical"
    value={values.source}
    options={[...SOURCE_OPTIONS]}
    onChange={(source) => update({ source })}
  />
);

export { SourceStep };
