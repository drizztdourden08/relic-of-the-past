/* @layer bridge-wasm @kind logic */
/**
 * The physical plan classes whose completion arrives from the substitution
 * seam (a fire id is allocated when they are armed, see apply-overrides.ts),
 * never from polling. Shared by live arming and the offline reader's
 * armed-check mirror, so the routing can never drift between the two.
 */
import type { PlanEntry } from './physical-plan.type';

const FIRE_REPORTED_CLASSES: ReadonlySet<PlanEntry['planClass']> =
  new Set(['override-npc', 'override-drop', 'override-standing', 'override-scripted', 'override-shop']);

export { FIRE_REPORTED_CLASSES };
