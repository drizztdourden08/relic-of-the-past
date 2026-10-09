/* @layer renderer-lib @kind logic */
import type { SchemeBindingsListener } from './scheme-runtime.type';

const bindingsListeners = new Set<SchemeBindingsListener>();

export { bindingsListeners };
