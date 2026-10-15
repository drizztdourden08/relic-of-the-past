/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { recallControllerName } from '@rotp/input-mapping';
import type { NameLookupParams } from '../diagnostics-wizard.type';

const useAddedDeviceNames = (): ((params: NameLookupParams) => string | null) => {
  return useCallback((params: NameLookupParams) => recallControllerName(params), []);
};

export { useAddedDeviceNames };
