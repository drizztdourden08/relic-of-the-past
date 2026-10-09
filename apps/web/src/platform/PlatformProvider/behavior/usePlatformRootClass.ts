/* @layer renderer-other @kind hook */
import { useEffect } from 'react';
import type { Platform } from '@shared/platform';

const usePlatformRootClass = (platform: Platform): void => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('platform-mobile', platform.info.formFactor === 'mobile');
    return () => root.classList.remove('platform-mobile');
  }, [platform]);
};

export { usePlatformRootClass };
