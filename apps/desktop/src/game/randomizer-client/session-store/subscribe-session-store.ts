/* @layer bridge-wasm @kind logic */
import { storeSlots } from './store-slots';
import type { SessionStoreListener } from './session-store.type';

const subscribeSessionStore = (listener: SessionStoreListener): (() => void) => {
  storeSlots.listeners.add(listener);
  return () => storeSlots.listeners.delete(listener);
};

export { subscribeSessionStore };
