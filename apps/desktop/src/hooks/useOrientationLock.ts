/* @layer renderer-app @kind hook */
import { useEffect } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { lockOrientation } from '@drizztdourden08/brock-display/renderer';
import { isMobileHost } from '@app/platform/is-mobile-host';
import type { AppSettings } from '@app/settings.type';
import { orientationForRatio } from './orientation-for-ratio';

const useOrientationLock = (): void => {
  const { settings } = useSettings<AppSettings>();
  const mode = orientationForRatio(settings);

  useEffect(() => {
    if (!isMobileHost()) return;
    void lockOrientation(mode);
  }, [mode]);
};

export { useOrientationLock };
