/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { log } from '../../log-bus';
import { getSessionState } from '../randomizer-client/session-store';
import { suppressLocationReport } from '../randomizer-client/location-poller';
import { deliverItem } from '../delivery-api';
import { markCheckCollected, grantVanilla } from '@rotp/randomizer';
import { cheatItemGrantAllowed } from '@rotp/game-core';
import type { CheckGrantPlan } from '@rotp/randomizer';
import { planCheckGrant } from './plan-check-grant';

const grantFromCheck = (check: CheckRecord, t: I18n['t']): CheckGrantPlan => {
  const plan = planCheckGrant(check, t);
  if (plan.kind === 'blocked') return plan;
  if (plan.kind === 'vanilla') {
    grantVanilla(check);
    return plan;
  }
  if (!cheatItemGrantAllowed()) return plan;
  const { itemId, itemLabel, locationName } = plan;
  const { session: grantSession } = getSessionState();
  suppressLocationReport(locationName);
  const onComplete = (): void => {
    if (getSessionState().session !== grantSession) {
      log.randomizer(`[Cheat] "${locationName}" was delivered but not cleared: the session changed `
        + 'under the grant, so the delivery may have been dropped instead of finishing', 'warn');
      return;
    }
    suppressLocationReport(locationName);
    markCheckCollected(check);
  };
  deliverItem({ itemId, message: itemLabel, source: 'cheat', onComplete });
  return plan;
};

export { grantFromCheck };
