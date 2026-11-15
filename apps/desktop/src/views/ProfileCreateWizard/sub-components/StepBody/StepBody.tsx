/* @layer renderer-components @kind component */
import { STEP_IDS } from '../../ProfileCreateWizard.constants';
import { ModuleStep } from '../ModuleStep';
import { ProfileStep } from '../ProfileStep';
import { ReviewStep } from '../ReviewStep';
import type { StepBodyProps } from './StepBody.type';

const StepBody = (props: StepBodyProps) => {
  const { wizard, modules, readyRoms, languages, msuPacks } = props;
  const { values, update } = wizard;

  switch (wizard.current.id) {
    case STEP_IDS.profile:
      return <ProfileStep values={values} update={update} readyRoms={readyRoms} languages={languages} msuPacks={msuPacks} />;
    case STEP_IDS.review:
      return <ReviewStep wizard={wizard} />;
    default:
      return <ModuleStep stepId={wizard.current.id} modules={modules} values={values} update={update} />;
  }
};

export { StepBody };
