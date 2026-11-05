/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { startSessionRuntime } from '@drizztdourden08/brock-randomizer/session';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import {
  clearPendingBoot, getPendingBoot, getSessionState, registerRotpFactories, setOnlineAllowed, stopActive,
} from '@app/game/randomizer-client';
import { rotpRandomizer } from '@app/randomizer/rotp-randomizer';

const useRandomizerRuntime = (): void => {
  const { settings } = useSettings<AppSettings>();
  const experimental = experimentalFeaturesEnabled(settings);

  useEffect(() => {
    registerRotpFactories();
    return startSessionRuntime(rotpRandomizer);
  }, []);

  useEffect(() => {
    setOnlineAllowed(experimental);
    if (experimental) return;
    if (getPendingBoot()?.mode === 'online') clearPendingBoot();
    if (getSessionState().session?.kind === 'online') stopActive();
  }, [experimental]);
};

export { useRandomizerRuntime };
