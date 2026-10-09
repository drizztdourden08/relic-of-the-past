/* @layer renderer-other @kind hook */
import { useContext } from 'react';
import type { Platform } from '@shared/platform';
import { PlatformContext } from './PlatformContext';

const usePlatform = (): Platform => {
  const platform = useContext(PlatformContext);
  if (!platform) throw new Error('usePlatform must be used within <PlatformProvider>');
  return platform;
};

export { usePlatform };
