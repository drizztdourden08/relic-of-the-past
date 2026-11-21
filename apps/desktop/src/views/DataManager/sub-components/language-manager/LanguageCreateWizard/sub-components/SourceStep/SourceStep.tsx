/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { RadioGroup } from '@drizztdourden08/tessera/primitives';
import { sourceOptions } from '../../behavior/source-options';
import type { SourceStepProps } from './SourceStep.type';

const SourceStep = ({ values, update, hasOwnSets }: SourceStepProps) => {
  const t = useT();
  return (
  <RadioGroup
    label={t('wizards:language.source.where-the-language-comes-from')}
    direction="vertical"
    value={values.source}
    options={sourceOptions(hasOwnSets, t)}
    onChange={(source) => update({ source })}
  />
  );
};

export { SourceStep };
