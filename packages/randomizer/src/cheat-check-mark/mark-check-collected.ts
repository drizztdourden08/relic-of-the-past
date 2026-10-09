/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import { cheatItemGrantAllowed } from '@rotp/game-core';
import { isWritable } from './is-writable';
import { markPlanOf } from './mark-plan-of';

const markCheckCollected = (check: CheckRecord): void => {
  if (!cheatItemGrantAllowed()) return;
  const plan = markPlanOf(check);
  if (isWritable(plan)) plan.write();
};

export { markCheckCollected };
