import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { pollInventoryState, getCompletedChecks, getCurrentInventory } from './lib/game/tracker';
import './design-system/reset.css';
import './design-system/tokens.css';

// Expose tracker bridge functions for live integration tests
(window as any).__trackerBridge = { pollInventoryState, getCompletedChecks, getCurrentInventory };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
