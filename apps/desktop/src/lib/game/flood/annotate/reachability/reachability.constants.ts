/* @layer bridge-wasm @kind constants */
import type { ScreenAnnotation } from '@shared/game/simulation';

const TOUCH = 2;

const SCREEN_WIDE: ReadonlySet<ScreenAnnotation['kind']> = new Set(['kill-trigger']);

const PHYSICAL: ReadonlySet<ScreenAnnotation['kind']> = new Set([
  'key-door', 'big-key-door', 'cell-lock', 'shutter', 'bombable', 'follower-gate',
]);

export { TOUCH, SCREEN_WIDE, PHYSICAL };
