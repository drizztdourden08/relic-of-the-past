/* @layer renderer-components @kind component */
import { RadioGroup } from '@drizztdourden08/tessera/primitives';
import { sourceOptions } from '../../behavior/source-options';
import type { SourceStepProps } from './SourceStep.type';

const SourceStep = ({ values, update, hasOwnSets }: SourceStepProps) => (
  <RadioGroup
    label="Where the language comes from"
    direction="vertical"
    value={values.source}
    options={sourceOptions(hasOwnSets)}
    onChange={(source) => update({ source })}
  />
);

export { SourceStep };
