/* @layer renderer-lib @kind logic */
import type { SchemeBindingsListener } from './scheme-runtime.type';
import { bindingsListeners } from './bindings-listeners';
import { schemeRuntime } from './scheme-runtime-state';

const onSchemeBindings = (listener: SchemeBindingsListener): (() => void) => {
  bindingsListeners.add(listener);
  listener(schemeRuntime.bindings);
  return () => { bindingsListeners.delete(listener); };
};

export { onSchemeBindings };
