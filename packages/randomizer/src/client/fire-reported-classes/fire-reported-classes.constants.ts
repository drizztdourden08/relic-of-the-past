/* @layer bridge-wasm @kind constants */
import type { PlanEntry } from '../physical-plan.type';

const FIRE_REPORTED_CLASSES: ReadonlySet<PlanEntry['planClass']> =
  new Set(['override-npc', 'override-drop', 'override-standing', 'override-scripted', 'override-shop']);

export { FIRE_REPORTED_CLASSES };
