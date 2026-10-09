/* @layer bridge-wasm @kind logic */
import type { MarkPlan, WritablePlan } from './cheat-check-mark.type';

const isWritable = (plan: MarkPlan): plan is WritablePlan => 'write' in plan;

export { isWritable };
