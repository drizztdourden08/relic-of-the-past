/* @layer renderer-views @kind view */
import { useT } from '@drizztdourden08/brock-react';
import { useMemo } from 'react';
import { Wizard } from '@drizztdourden08/tessera/composites';
import { OptionTabContext } from '@app/randomizer/wizard/option-tab-context';
import type { ProfileCreateWizardProps } from './ProfileCreateWizard.type';
import { useProfileWizard } from './behavior/useProfileWizard';
import { StepBody } from './sub-components/StepBody';

const ProfileCreateWizard = (props: ProfileCreateWizardProps) => {
  const t = useT();
  const { readyRoms, languages, msuPacks, onCreateProfile, onCancel, onCreated } = props;
  const { wizard, modules, optionTab, setOptionTab, handleSubStepSelect } = useProfileWizard({ onCreateProfile, onCreated });

  const tabControl = useMemo(() => ({ tab: optionTab, setTab: setOptionTab }), [optionTab, setOptionTab]);

  return (
    <OptionTabContext.Provider value={tabControl}>
      <Wizard
        wizard={wizard}
        title={t('wizards:profile.title')}
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
