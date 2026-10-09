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
import '@drizztdourden08/tessera/tokens.css';
import '@drizztdourden08/tessera/palettes/rotp.css';
import './theme.css';
import type { LiveTestWindow } from './main.type';

installSessionLogTap();

const liveTestWindow = window as LiveTestWindow;
liveTestWindow.__trackerBridge = { pollInventoryState, getCompletedChecks, getCurrentInventory };
liveTestWindow.__deliveryApi = { deliverItem, deliverNpcCheck, getQueueState: deliveryQueue.getState, triggerNpcCheck: cheatTriggerNpcCheck };

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <PlatformProvider>
      <App />
    </PlatformProvider>
  </StrictMode>,
);
