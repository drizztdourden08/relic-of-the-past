/* @layer shared-input @kind logic */
import { STRATEGIES } from './remap-for-scheme.constants';
import type { RemapRequest } from './remap-for-scheme.type';
import type { RemapResult } from './remap.type';

const remapForScheme = (request: RemapRequest): RemapResult => {
  return STRATEGIES[request.scheme](request);
};

export { remapForScheme };
