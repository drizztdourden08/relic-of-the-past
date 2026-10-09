/* @layer bridge-wasm @kind logic */
import { clearActive } from './clear-active';
import { notifySessionStore } from './notify-session-store';
import { storeSlots } from './store-slots';

const stopActive = (): void => {
  if (!storeSlots.session) return;
  const active = storeSlots.session;
  clearActive();
  active.stop();
  notifySessionStore();
};

export { stopActive };
