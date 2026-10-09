/* @layer bridge-wasm @kind constants */
import type { PlanEntry } from './physical-plan.type';

const COMPLETION_NOTE: Partial<Record<PlanEntry['planClass'], string>> = {
  'override': 'granted physically',
  'override-npc': 'granted natively by the giver',
  'override-drop': 'granted physically by the drop',
  'override-standing': 'granted physically by the pickup',
  'override-scripted': 'granted by the scripted giver',
  'override-shop': 'bought from the shelf',
};

const CLASS_DEFAULT_MESSAGE = -1;

export { CLASS_DEFAULT_MESSAGE, COMPLETION_NOTE };
