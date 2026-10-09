/* @layer renderer-lib @kind logic */
import { emptyFunctionMask } from '../../scheme';
import type { SchemeRuntime } from './scheme-runtime.type';

const noMenuListener = (): void => undefined;

const schemeRuntime: SchemeRuntime = {
  scheme: 'classic',
  bindings: null,
  core: null,
  assignments: { assignments: {} },
  mapOnSelect: false,
  menuSink: { open: false, push: noMenuListener },
  prev: emptyFunctionMask(),
  reseedPrev: false,
};

export { schemeRuntime };
