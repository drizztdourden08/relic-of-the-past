/* @layer renderer-other @kind logic */
import type { Platform } from '@shared/platform';
import { resolvePlatform } from '@shared/platform';
import { createElectronFactory } from './hosts/electron-factory';
import { createWebFactory } from './hosts/web-factory';
import { createCapacitorFactory } from './hosts/capacitor-factory';

let cached: Platform | null = null;

const getPlatform = (): Platform => {
  if (!cached) {
    cached = resolvePlatform({
      electron: createElectronFactory,
      capacitor: createCapacitorFactory,
      web: createWebFactory,
    });
  }
  return cached;
};

export { getPlatform };
