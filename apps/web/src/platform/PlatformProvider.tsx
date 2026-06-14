/* @layer renderer-other @kind component */
/**
 * Resolves the Platform facade once at mount and provides it via context. The
 * factory map is the only place hosts are registered; resolvePlatform picks one
 * by runtime detection (the Strategy selection / composition root).
 */
import { createContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Platform } from '@shared/platform';
import { resolvePlatform } from '@shared/platform';
import { createElectronFactory } from './hosts/electron-factory';
import { createWebFactory } from './hosts/web-factory';

const PlatformContext = createContext<Platform | null>(null);

const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const platform = useMemo(
    () => resolvePlatform({
      electron: createElectronFactory,
      web: createWebFactory,
    }),
    [],
  );
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
};

export { PlatformProvider, PlatformContext };
