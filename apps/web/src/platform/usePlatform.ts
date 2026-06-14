/* @layer renderer-other @kind hook */
/**
 * Renderer access to the platform facade. Components branch on a capability via
 * useCapability(); imperative platform calls go through usePlatform().
 */
import { useContext } from 'react';
import type { Capabilities, Platform } from '@shared/platform';
import { PlatformContext } from './PlatformProvider';

const usePlatform = (): Platform => {
  const platform = useContext(PlatformContext);
  if (!platform) throw new Error('usePlatform must be used within <PlatformProvider>');
  return platform;
};

const useCapability = (key: keyof Capabilities): boolean => usePlatform().capabilities[key];

export { usePlatform, useCapability };
