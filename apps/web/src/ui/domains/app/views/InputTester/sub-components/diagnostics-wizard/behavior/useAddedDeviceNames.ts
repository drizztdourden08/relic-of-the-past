/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { recallControllerName } from '@app/lib/input/controller-name-cache';
import type { NameLookupParams } from '../diagnostics-wizard.type';

const useAddedDeviceNames = (): ((params: NameLookupParams) => string | null) => {
  return useCallback((params: NameLookupParams) => recallControllerName(params), []);
};

export { useAddedDeviceNames };
export type { NameLookupParams };
