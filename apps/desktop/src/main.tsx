import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installTrackerDebug } from './lib/game/tracker/debug-mock';
import { pollInventoryState, getCompletedChecks, getCurrentInventory } from './lib/game/tracker';
import './lib/game/procon2-vibrate'; // registers window.__procon2Vibrate
import './design-system/reset.css';
import './design-system/tokens.css';

// Install tracker debug API (always available for testing; mock is inert until enable() is called)
installTrackerDebug();

// Expose tracker bridge functions for live integration tests
(window as any).__trackerBridge = { pollInventoryState, getCompletedChecks, getCurrentInventory };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
