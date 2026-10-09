/* @layer bridge-wasm @kind constants */
import type { ScreenAnnotation } from '@shared/game/simulation';

const CHECK_KINDS: ReadonlySet<ScreenAnnotation['kind']> = new Set(['chest', 'big-chest', 'npc-check', 'standing-item']);

export { CHECK_KINDS };
