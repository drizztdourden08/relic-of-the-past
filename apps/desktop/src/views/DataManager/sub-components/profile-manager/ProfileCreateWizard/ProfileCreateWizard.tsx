/* @layer renderer-views @kind view */
import { Wizard } from '@drizztdourden08/tessera/composites';
import { WIZARD_TITLE } from './ProfileCreateWizard.constants';
import type { ProfileCreateWizardProps } from './ProfileCreateWizard.type';
import { useProfileWizard } from './behavior/useProfileWizard';
import { StepBody } from './sub-components/StepBody';

const ProfileCreateWizard = (props: ProfileCreateWizardProps) => {
  const { readyRoms, languages, msuPacks, onCreateProfile, onCancel, onCreated } = props;
  const { wizard, experimental, optionTab, setOptionTab, handleSubStepSelect } = useProfileWizard({ onCreateProfile, onCreated });

  return (
    <Wizard
      wizard={wizard}
      title={WIZARD_TITLE}
      orientation="vertical"
      stepperSize="sm"
      activeSubStepId={optionTab}
      onSubStepSelect={handleSubStepSelect}
      onExit={onCancel}
    >
      <StepBody
        wizard={wizard}
        experimental={experimental}
        optionTab={optionTab}
        onOptionTab={setOptionTab}
        readyRoms={readyRoms}
        languages={languages}
        msuPacks={msuPacks}
      />
    </Wizard>
  );
};

export { ProfileCreateWizard };
