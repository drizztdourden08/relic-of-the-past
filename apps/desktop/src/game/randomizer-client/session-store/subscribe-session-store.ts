/* @layer bridge-wasm @kind logic */
import { installBridge } from './install-bridge';
import { storeSlots } from './store-slots';
import type { SessionStoreListener } from './session-store.type';

const subscribeSessionStore = (listener: SessionStoreListener): (() => void) => {
  installBridge();
  storeSlots.listeners.add(listener);
  return () => storeSlots.listeners.delete(listener);
};

export { subscribeSessionStore };
