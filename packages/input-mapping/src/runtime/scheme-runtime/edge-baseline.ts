/* @layer renderer-lib @kind logic */
import type { FunctionMask } from '../../scheme';
import { schemeRuntime } from './scheme-runtime-state';

const edgeBaseline = (pressed: FunctionMask): FunctionMask => {
  if (!schemeRuntime.reseedPrev) return schemeRuntime.prev;
  schemeRuntime.reseedPrev = false;
  return pressed;
};

export { edgeBaseline };
