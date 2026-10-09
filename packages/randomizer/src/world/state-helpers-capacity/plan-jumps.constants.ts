/* @layer shared-game @kind constants */
import type { FamilySetting } from '../capacity/capacity-profile.type';

const PLAN_JUMPS = new WeakMap<FamilySetting, readonly number[]>();

export { PLAN_JUMPS };
