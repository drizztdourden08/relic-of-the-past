/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import { FIRST_OPTION_TAB } from '../../randomizer-options/option-tabs.constants';
import type { PanelTab } from '../../RandomizerOptionsPanel.type';
import { STEP_IDS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues, UseProfileWizardParams } from '../ProfileCreateWizard.type';
import { createProfileFromValues } from './create-profile-from-values';
import { initialProfileValues } from './initial-profile-values';
import { profileWizardSteps } from './profile-wizard-steps';

const useProfileWizard = ({ onCreateProfile, onCreated }: UseProfileWizardParams) => {
  const { settings } = useSettings<AppSettings>();
  const experimental = experimentalFeaturesEnabled(settings);
  const [joining, setJoining] = useState<number | null>(null);
  const [optionTab, setOptionTab] = useState<PanelTab>(FIRST_OPTION_TAB);
  const [initialValues] = useState(initialProfileValues);
  const steps = useMemo(() => profileWizardSteps({ experimental, joining }), [experimental, joining]);

  const handleFinish = useCallback(async (values: ProfileWizardValues) => {
    try {
      return await createProfileFromValues(values, { experimental, onCreateProfile, onProgress: setJoining });
    } finally {
      setJoining(null);
    }
  }, [experimental, onCreateProfile]);

  const wizard = useWizard({ steps, initialValues, onFinish: handleFinish, onFinished: onCreated });

  const handleSubStepSelect = useCallback((stepId: string, subStepId: string) => {
    if (stepId === STEP_IDS.options) setOptionTab(subStepId as PanelTab);
  }, []);

  return { wizard, experimental, joining, optionTab, setOptionTab, handleSubStepSelect };
};

export { useProfileWizard };
