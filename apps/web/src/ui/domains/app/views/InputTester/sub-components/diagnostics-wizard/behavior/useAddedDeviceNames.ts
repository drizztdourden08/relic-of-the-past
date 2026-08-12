/* @layer renderer-components @kind hook */
/**
 * Names for the devices offered by the choose-a-controller step.
 *
 * Reads the session-wide cache rather than subscribing here. A device
 * announces its name when it connects, and by the time this dialog opens the
 * run has already released every controller, so nothing will announce itself
 * again until step 4 restores them. A listener created here would therefore
 * see nothing and every row would read as unknown, which is the one thing
 * this step exists to answer.
 *
 * Devices reached over a raw USB interface also report an empty OS product
 * string, so the cache is the only place a real name is available for them.
 */
import { useCallback } from 'react';
import { recallControllerName } from '@app/lib/input/controller-name-cache';

interface NameLookupParams {
  deviceKey?: string;
  vendorId?: number;
  productId?: number;
}

const useAddedDeviceNames = (): ((params: NameLookupParams) => string | null) => {
  return useCallback((params: NameLookupParams) => recallControllerName(params), []);
};

export { useAddedDeviceNames };
export type { NameLookupParams };
