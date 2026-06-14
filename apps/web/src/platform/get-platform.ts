/* @layer renderer-other @kind logic */
/**
 * Module-level Platform singleton. Resolved once via the same factory map the
 * PlatformProvider uses, so hooks (context) and plain modules (this accessor)
 * share one instance. Lets non-React modules reach platform ports (e.g. files).
 */
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
