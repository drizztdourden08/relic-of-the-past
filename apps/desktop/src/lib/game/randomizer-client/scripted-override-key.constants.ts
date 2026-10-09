/* @layer bridge-wasm @kind constants */
import type { ScriptedGrantSurface } from '../scripted-grant-overrides';

const SCRIPTED_SURFACE_BY_CHECK: ReadonlyMap<string, ScriptedGrantSurface> = new Map<string, ScriptedGrantSurface>([
  ['check-273', { surface: 'capacity', kind: 0 }],
  ['check-274', { surface: 'capacity', kind: 1 }],
  ['check-040', { surface: 'bat' }],
  ['check-270', { surface: 'minigame', roomId: 262 }],
]);

export { SCRIPTED_SURFACE_BY_CHECK };
