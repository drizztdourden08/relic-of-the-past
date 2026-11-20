/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { defineBootTask } from '@drizztdourden08/brock-react';
import { pollInventoryState, getCompletedChecks, getCurrentInventory } from '@app/game/tracker';
import { deliverItem, deliverNpcCheck } from '@app/game/delivery-api';
import { deliveryQueue } from '@app/game/delivery-queue';
import { cheatTriggerNpcCheck } from '@rotp/randomizer';
import type { LiveTestWindow } from '@app/main.type';

export default defineBootTask({
  label: msg('views-game-layer:boot.test-hooks'),
  run: ({ report }) => {
    const target = window as LiveTestWindow;
    target.__trackerBridge = { pollInventoryState, getCompletedChecks, getCurrentInventory };
    target.__deliveryApi = { deliverItem, deliverNpcCheck, getQueueState: deliveryQueue.getState, triggerNpcCheck: cheatTriggerNpcCheck };
    report(1);
  },
});
