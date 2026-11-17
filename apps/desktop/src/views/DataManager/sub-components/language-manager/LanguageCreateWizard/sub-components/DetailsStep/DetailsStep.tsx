/* @layer renderer-components @kind component */
import { PatchedFields } from './sub-components/PatchedFields';
import { RomFields } from './sub-components/RomFields';
import { SetFields } from './sub-components/SetFields';
import type { DetailsStepProps } from './DetailsStep.type';

const DetailsStep = ({ values, update, baseSets }: DetailsStepProps) => {
  if (values.source === 'rom') return <RomFields values={values} update={update} />;
  if (values.source === 'patched') return <PatchedFields values={values} update={update} />;
  return <SetFields values={values} update={update} baseSets={baseSets} />;
};

export { DetailsStep };
