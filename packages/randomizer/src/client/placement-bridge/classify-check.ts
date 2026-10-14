/* @layer bridge-wasm @kind logic */
import { classifyChest } from './classify-chest';
import { classifyDeliver } from './classify-deliver';
import { classifyKeyDrop } from './classify-key-drop';
import type { CheckPlanContext } from './classify-location.type';
import { classifyOverride } from './classify-override';
import type { PlanEntry, PlanError } from '../physical-plan.type';

const classifyCheck = (ctx: CheckPlanContext): PlanEntry | PlanError =>
  classifyChest(ctx) ?? classifyOverride(ctx) ?? classifyKeyDrop(ctx) ?? classifyDeliver(ctx);

export { classifyCheck };
