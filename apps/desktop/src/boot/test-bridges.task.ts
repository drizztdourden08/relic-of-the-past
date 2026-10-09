/* @layer renderer-app @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-react';
import { pollInventoryState, getCompletedChecks, getCurrentInventory } from '@app/lib/game/tracker';
import { deliverItem, deliverNpcCheck } from '@app/lib/game/delivery-api';
import { deliveryQueue } from '@app/lib/game/delivery-queue';
import { cheatTriggerNpcCheck } from '@rotp/randomizer';
import type { LiveTestWindow } from '@app/main.type';

export default defineBootTask({
  label: 'Preparing the test hooks',
  run: ({ report }) => {
    const target = window as LiveTestWindow;
    target.__trackerBridge = { pollInventoryState, getCompletedChecks, getCurrentInventory };
    target.__deliveryApi = { deliverItem, deliverNpcCheck, getQueueState: deliveryQueue.getState, triggerNpcCheck: cheatTriggerNpcCheck };
    report(1);
  },
});
