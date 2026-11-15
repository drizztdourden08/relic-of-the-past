/* @layer renderer-views @kind view */
import { useMemo } from 'react';
import { Wizard } from '@drizztdourden08/tessera/composites';
import { OptionTabContext } from '@app/randomizer/wizard/option-tab-context';
import { WIZARD_TITLE } from './ProfileCreateWizard.constants';
import type { ProfileCreateWizardProps } from './ProfileCreateWizard.type';
import { useProfileWizard } from './behavior/useProfileWizard';
import { StepBody } from './sub-components/StepBody';

const ProfileCreateWizard = (props: ProfileCreateWizardProps) => {
  const { readyRoms, languages, msuPacks, onCreateProfile, onCancel, onCreated } = props;
  const { wizard, modules, optionTab, setOptionTab, handleSubStepSelect } = useProfileWizard({ onCreateProfile, onCreated });

  const tabControl = useMemo(() => ({ tab: optionTab, setTab: setOptionTab }), [optionTab, setOptionTab]);

  return (
    <OptionTabContext.Provider value={tabControl}>
      <Wizard
        wizard={wizard}
        title={WIZARD_TITLE}
        orientation="vertical"
        stepperSize="sm"
        activeSubStepId={optionTab}
        onSubStepSelect={handleSubStepSelect}
        onExit={onCancel}
      >
        <StepBody wizard={wizard} modules={modules} readyRoms={readyRoms} languages={languages} msuPacks={msuPacks} />
      </Wizard>
    </OptionTabContext.Provider>
  );
};

export { ProfileCreateWizard };
