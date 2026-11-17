/* @layer renderer-components @kind component */
import { STEP_IDS } from '../../LanguageCreateWizard.constants';
import { DetailsStep } from '../DetailsStep';
import { ImportStep } from '../ImportStep';
import { ReviewStep } from '../ReviewStep';
import { SourceStep } from '../SourceStep';
import type { StepBodyProps } from './StepBody.type';

const StepBody = (props: StepBodyProps) => {
  const { wizard, sets, baseSets, progress, patched } = props;
  const { values, update } = wizard;

  switch (wizard.current.id) {
    case STEP_IDS.source:
      return <SourceStep values={values} update={update} hasOwnSets={baseSets.length > 0} />;
    case STEP_IDS.details:
      return <DetailsStep values={values} update={update} baseSets={baseSets} />;
    case STEP_IDS.import:
      return <ImportStep wizard={wizard} sets={sets} progress={progress} patched={patched} />;
    default:
      return <ReviewStep wizard={wizard} sets={sets} progress={progress} />;
  }
};

export { StepBody };
