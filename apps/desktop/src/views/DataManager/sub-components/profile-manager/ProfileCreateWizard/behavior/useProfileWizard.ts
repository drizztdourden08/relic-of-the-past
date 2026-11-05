/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { useModuleWizardSteps, useSettings } from '@drizztdourden08/brock-react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import type { ProfileWizardValues, UseProfileWizardParams } from '../ProfileCreateWizard.type';
import { createProfileFromValues } from './create-profile-from-values';
import { initialProfileValues } from './initial-profile-values';
import { profileWizardSteps } from './profile-wizard-steps';
import { rotpLobbyStep } from './rotp-lobby-step';

const useProfileWizard = ({ onCreateProfile, onCreated }: UseProfileWizardParams) => {
  const { settings } = useSettings<AppSettings>();
  const experimental = experimentalFeaturesEnabled(settings);
  const moduleSteps = useModuleWizardSteps();
  const [joining, setJoining] = useState<number | null>(null);
  const modules = useMemo(() => [...moduleSteps, rotpLobbyStep], [moduleSteps]);
  const [initialValues] = useState(() => initialProfileValues(modules));
  const steps = useMemo(() => profileWizardSteps({ joining, modules }), [joining, modules]);

  const handleFinish = useCallback(async (values: ProfileWizardValues) => {
    try {
      return await createProfileFromValues(values, { experimental, modules, onCreateProfile, onProgress: setJoining });
    } finally {
      setJoining(null);
    }
  }, [experimental, modules, onCreateProfile]);

  const wizard = useWizard({ steps, initialValues, onFinish: handleFinish, onFinished: onCreated });

  return { wizard, modules };
};

export { useProfileWizard };
