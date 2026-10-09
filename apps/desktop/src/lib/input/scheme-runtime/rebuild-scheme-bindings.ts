/* @layer renderer-lib @kind logic */
import type { DeviceEntry } from '@shared/ipc';
import type { InputProfile } from '@shared/types/controls';
import { resolveCoreBindings, resolveModernBindings } from '../resolve-bindings';
import { bindingsListeners } from './bindings-listeners';
import { reseedEdges } from './reseed-edges';
import { schemeRuntime } from './scheme-runtime-state';

const sameResolution = (a: unknown, b: unknown): boolean =>
  a === b || (a != null && b != null && JSON.stringify(a) === JSON.stringify(b));

const rebuildSchemeBindings = (profile: InputProfile | null, devices: readonly DeviceEntry[]): void => {
  const nextCore = resolveCoreBindings(profile, devices);
  const coreMoved = !sameResolution(schemeRuntime.core, nextCore);
  if (coreMoved) schemeRuntime.core = nextCore;
  const next = resolveModernBindings(profile, devices);
  if (sameResolution(schemeRuntime.bindings, next)) {
    if (coreMoved) reseedEdges();
    return;
  }
  schemeRuntime.bindings = next;
  reseedEdges();
  for (const listener of bindingsListeners) {
    try { listener(next); } catch (e: unknown) { console.error('[controls] bindings listener failed', e); }
  }
};

export { rebuildSchemeBindings };
