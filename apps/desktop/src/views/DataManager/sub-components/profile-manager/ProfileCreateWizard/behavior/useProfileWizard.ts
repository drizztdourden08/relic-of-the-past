/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { OPTIONS_STEP_ID, useRollProgress } from '@drizztdourden08/brock-randomizer/renderer';
import { useModuleWizardSteps, useSettings } from '@drizztdourden08/brock-react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import { FIRST_OPTION_TAB } from '../../randomizer-options/option-tabs.constants';
import type { PanelTab } from '../../RandomizerOptionsPanel.type';
import type { ProfileWizardValues, UseProfileWizardParams } from '../ProfileCreateWizard.type';
import { createProfileFromValues } from './create-profile-from-values';
import { initialProfileValues } from './initial-profile-values';
import { profileWizardSteps } from './profile-wizard-steps';
import { withStepFacts } from './with-step-facts';

const useProfileWizard = ({ onCreateProfile, onCreated }: UseProfileWizardParams) => {
  const { settings } = useSettings<AppSettings>();
  const experimental = experimentalFeaturesEnabled(settings);
  const moduleSteps = useModuleWizardSteps();
  const [optionTab, setOptionTab] = useState<PanelTab>(FIRST_OPTION_TAB);
  const joining = useRollProgress((state) => state.fraction);
  const modules = useMemo(() => moduleSteps.map(withStepFacts), [moduleSteps]);
  const [initialValues] = useState(() => initialProfileValues(modules));
  const steps = useMemo(() => profileWizardSteps({ joining, modules }), [joining, modules]);

  const handleFinish = useCallback(async (values: ProfileWizardValues) => {
    try {
      return await createProfileFromValues(values, { experimental, modules, onCreateProfile });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }, [experimental, modules, onCreateProfile]);

  const wizard = useWizard({ steps, initialValues, onFinish: handleFinish, onFinished: onCreated });

  const handleSubStepSelect = useCallback((stepId: string, subStepId: string) => {
    if (stepId === OPTIONS_STEP_ID) setOptionTab(subStepId as PanelTab);
  }, []);

  return { wizard, modules, optionTab, setOptionTab, handleSubStepSelect };
};

export { useProfileWizard };
