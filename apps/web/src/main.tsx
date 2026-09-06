/* @layer renderer-other @kind component */
import './platform/install-api-shim';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PlatformProvider } from './platform';
import { pollInventoryState, getCompletedChecks, getCurrentInventory } from './lib/game/tracker';
import { deliverItem, deliverNpcCheck } from './lib/game/delivery-api';
import { deliveryQueue } from './lib/game/delivery-queue';
import { cheatTriggerNpcCheck } from './lib/game/cheats';
import { installSessionLogTap } from './lib/diagnostics/session-log';
import './ui/design-system/tokens/index.css';

// Every launch: stream the log-bus (ring-evicted entries included) to
// Data/debug/session.log via the main process — see lib/diagnostics/session-log.
installSessionLogTap();

// Expose tracker bridge functions for live integration tests
(window as any).__trackerBridge = { pollInventoryState, getCompletedChecks, getCurrentInventory };
// Expose the delivery path the same way, so live tests can drive a real queued
// delivery and observe its completion instead of poking the core directly.
// triggerNpcCheck replays a giver's vanilla grant through the queue (the cheat
// trigger), which is how a live test exercises the npc-override seam.
// deliverNpcCheck enqueues the assigned-form scripted-giver trigger — the exact
// action a session's poller enqueues — so a live test can prove the cheatless
// delivery path end to end.
(window as any).__deliveryApi = { deliverItem, deliverNpcCheck, getQueueState: deliveryQueue.getState, triggerNpcCheck: cheatTriggerNpcCheck };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider>
      <App />
    </PlatformProvider>
  </StrictMode>,
);
