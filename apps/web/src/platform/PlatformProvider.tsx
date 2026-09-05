/* @layer renderer-other @kind component */
/**
 * Resolves the Platform facade once at mount and provides it via context. The
 * factory map is the only place hosts are registered; resolvePlatform picks one
 * by runtime detection (the Strategy selection / composition root).
 */
import { createContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Platform } from '@shared/platform';
import { getPlatform } from './get-platform';

const PlatformContext = createContext<Platform | null>(null);

const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const platform = useMemo(() => getPlatform(), []);

  // Reflect the platform on the document root so CSS (including portaled modals,
  // which sit outside the app subtree) can branch on it. One example is plain
  // full-screen pages on mobile.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('platform-mobile', platform.info.formFactor === 'mobile');
    return () => root.classList.remove('platform-mobile');
  }, [platform]);

  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
};

export { PlatformProvider, PlatformContext };
