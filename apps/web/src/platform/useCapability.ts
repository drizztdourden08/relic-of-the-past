/* @layer renderer-other @kind hook */
import type { Capabilities } from '@shared/platform';
import { usePlatform } from './usePlatform';

const useCapability = (key: keyof Capabilities): boolean => usePlatform().capabilities[key];

export { useCapability };
