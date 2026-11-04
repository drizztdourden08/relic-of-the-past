/* @layer renderer-components @kind component */
import { STEP_IDS } from '../../ProfileCreateWizard.constants';
import { ConnectionStep } from '../ConnectionStep';
import { OptionsStep } from '../OptionsStep';
import { ProfileStep } from '../ProfileStep';
import { RandomizerStep } from '../RandomizerStep';
import { ReviewStep } from '../ReviewStep';
import type { StepBodyProps } from './StepBody.type';

const StepBody = (props: StepBodyProps) => {
  const { wizard, experimental, optionTab, onOptionTab, readyRoms, languages, msuPacks } = props;
  const { values, update } = wizard;

  switch (wizard.current.id) {
    case STEP_IDS.profile:
      return <ProfileStep values={values} update={update} readyRoms={readyRoms} languages={languages} msuPacks={msuPacks} />;
    case STEP_IDS.randomizer:
      return <RandomizerStep values={values} update={update} experimental={experimental} />;
    case STEP_IDS.connection:
      return <ConnectionStep values={values} update={update} />;
    case STEP_IDS.options:
      return <OptionsStep values={values} update={update} tab={optionTab} onTabChange={onOptionTab} />;
    case STEP_IDS.review:
      return <ReviewStep wizard={wizard} experimental={experimental} />;
    default:
      return null;
  }
};

export { StepBody };
