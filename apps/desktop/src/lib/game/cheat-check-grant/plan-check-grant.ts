/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { locationKeyOfCheck } from '@shared/randomizer/world/location-record';
import { currentRun } from '../randomizer-client/run-kind';
import { standardCheckName } from '../randomizer-client/check-names';
import { resolveLocalItemId } from '../randomizer-client/item-lookup';
import { isWritable, markPlanOf } from '../cheat-check-mark';
import type { CheckGrantPlan } from './cheat-check-grant.type';
import { canGrantVanilla } from './can-grant-vanilla';
import { vanillaItemLabelOf } from './vanilla-item-label-of';

const planCheckGrant = (check: CheckRecord): CheckGrantPlan => {
  const run = currentRun();
  if (run.kind === 'online') {
    return {
      kind: 'blocked',
      reason: 'an online session scouts its items one at a time, so what this location holds is '
        + 'not known here. Collect it in game, or ask the server to release it.',
    };
  }
  if (run.kind === 'normal') {
    return canGrantVanilla(check)
      ? { kind: 'vanilla', itemLabel: vanillaItemLabelOf(check) }
      : { kind: 'blocked', reason: 'the console has no vanilla trigger for this check' };
  }
  const { placement } = run;
  const markPlan = markPlanOf(check);
  if (!isWritable(markPlan)) {
    return { kind: 'blocked', reason: `it cannot be cleared here, because ${markPlan.refusal}` };
  }
  const itemLabel = placement.locations[locationKeyOfCheck(check.id)];
  if (itemLabel === undefined) {
    return { kind: 'blocked', reason: 'this seed placed nothing at this location' };
  }
  const itemName = itemKeyName(itemLabel);
  const itemId = resolveLocalItemId(itemName);
  if (itemId === undefined) {
    return { kind: 'blocked', reason: `"${itemName}" cannot be handed over directly` };
  }
  return { kind: 'placed', itemId, itemLabel: itemName, locationName: standardCheckName(check.id) };
};

export { planCheckGrant };
