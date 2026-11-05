/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import {
  clearPendingBoot, getPendingBoot, getSessionState, registerRotpFactories, setOnlineAllowed, stopActive,
} from '@app/game/randomizer-client';

const useRandomizerRuntime = (): void => {
  const { settings } = useSettings<AppSettings>();
  const experimental = experimentalFeaturesEnabled(settings);

  useEffect(() => {
    registerRotpFactories();
  }, []);

  useEffect(() => {
    setOnlineAllowed(experimental);
    if (experimental) return;
    if (getPendingBoot()?.mode === 'online') clearPendingBoot();
    if (getSessionState().session?.kind === 'online') stopActive();
  }, [experimental]);
};

export { useRandomizerRuntime };
