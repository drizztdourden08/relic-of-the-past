/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@shared/game/data';
import { log } from '../../log-bus';
import { getSessionState } from '../randomizer-client/session-store';
import { suppressLocationReport } from '../randomizer-client/location-poller';
import { deliverItem } from '../delivery-api';
import { markCheckCollected } from '../cheat-check-mark';
import { cheatItemGrantAllowed } from '../cheats';
import type { CheckGrantPlan } from './cheat-check-grant.type';
import { grantVanilla } from './grant-vanilla';
import { planCheckGrant } from './plan-check-grant';

const grantFromCheck = (check: CheckRecord): CheckGrantPlan => {
  const plan = planCheckGrant(check);
  if (plan.kind === 'blocked') return plan;
  if (plan.kind === 'vanilla') {
    grantVanilla(check);
    return plan;
  }
  if (!cheatItemGrantAllowed()) return plan;
  const { itemId, itemLabel, locationName } = plan;
  const { session: grantSession } = getSessionState();
  suppressLocationReport(locationName);
  deliverItem(itemId, itemLabel, 'cheat', undefined, () => {
    if (getSessionState().session !== grantSession) {
      log.randomizer(`[Cheat] "${locationName}" was delivered but not cleared: the session changed `
        + 'under the grant, so the delivery may have been dropped instead of finishing', 'warn');
      return;
    }
    suppressLocationReport(locationName);
    markCheckCollected(check);
  });
  return plan;
};

export { grantFromCheck };
