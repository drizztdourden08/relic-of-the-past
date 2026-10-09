/* @layer renderer-other @kind component */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { getPlatform } from '../get-platform';
import { PlatformContext } from '../platform-context';
import { usePlatformRootClass } from './behavior/usePlatformRootClass';

const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const platform = useMemo(() => getPlatform(), []);
  usePlatformRootClass(platform);
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
};

export { PlatformProvider };
