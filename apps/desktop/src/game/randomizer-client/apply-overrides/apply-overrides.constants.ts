/* @layer bridge-wasm @kind constants */
import { applyChestOverride } from './appliers/apply-chest-override';
import { applyDropOverride } from './appliers/apply-drop-override';
import { applyNpcOverride } from './appliers/apply-npc-override';
import { applyScriptedOverride } from './appliers/apply-scripted-override';
import { applyShopOverride } from './appliers/apply-shop-override';
import { applyStandingOverride } from './appliers/apply-standing-override';
import type { OverrideApplier } from './appliers/override-applier.type';
import type { PlanClass } from '@rotp/randomizer';

const OVERRIDE_APPLIERS: Partial<Record<PlanClass, OverrideApplier>> = {
  override: applyChestOverride,
  'override-npc': applyNpcOverride,
  'override-drop': applyDropOverride,
  'override-standing': applyStandingOverride,
  'override-shop': applyShopOverride,
  'override-scripted': applyScriptedOverride,
};

export { OVERRIDE_APPLIERS };
