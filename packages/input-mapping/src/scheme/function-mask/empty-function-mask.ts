/* @layer shared-input @kind logic */
import { EMPTY_MENU } from './function-mask.constants';
import type { FunctionMask } from './function-mask.type';

const emptyFunctionMask = (): FunctionMask => {
  return { dpad: 0, pause: false, map: false, menu: { ...EMPTY_MENU }, slots: [] };
};

export { emptyFunctionMask };
