/* @layer bridge-wasm @kind logic */
import type { BridgeState } from './wasm-bridge.type';

const bridgeState: BridgeState = {
  currentModule: null,
  currentState: { status: 'idle', error: null },
  currentProfileId: null,
  listeners: new Set(),
};

export { bridgeState };
