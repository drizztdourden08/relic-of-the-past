/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { itemKeyName, locationKeyOfCheck, standardCheckName, resolveLocalItemId, isWritable, markPlanOf, canGrantVanilla, vanillaItemLabelOf } from '@rotp/randomizer';
import { currentRun } from '../randomizer-client/run-kind';
import type { CheckGrantPlan } from '@rotp/randomizer';

const planCheckGrant = (check: CheckRecord, t: I18n['t']): CheckGrantPlan => {
  const run = currentRun();
  if (run.kind === 'online') {
    return {
      kind: 'blocked',
      reason: t('views-cheats:grant.blocked.online'),
    };
  }
  if (run.kind === 'normal') {
    return canGrantVanilla(check)
      ? { kind: 'vanilla', itemLabel: vanillaItemLabelOf(check) }
      : { kind: 'blocked', reason: t('views-cheats:grant.blocked.noTrigger') };
  }
  const { placement } = run;
  const markPlan = markPlanOf(check);
  if (!isWritable(markPlan)) {
    return { kind: 'blocked', reason: t('views-cheats:grant.blocked.cannotClear', { reason: markPlan.refusal }) };
  }
  const itemLabel = placement.locations[locationKeyOfCheck(check.id)];
  if (itemLabel === undefined) {
    return { kind: 'blocked', reason: t('views-cheats:grant.blocked.nothingPlaced') };
  }
  const itemName = itemKeyName(itemLabel);
  const itemId = resolveLocalItemId(itemName);
  if (itemId === undefined) {
    return { kind: 'blocked', reason: t('views-cheats:grant.blocked.noDirect', { item: itemName }) };
  }
  return { kind: 'placed', itemId, itemLabel: itemName, locationName: standardCheckName(check.id) };
};

export { planCheckGrant };
