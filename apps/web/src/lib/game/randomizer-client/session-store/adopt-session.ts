/* @layer bridge-wasm @kind logic */
import { clearActive } from './clear-active';
import { dropOnlinePlacement } from './drop-online-placement';
import { notifySessionStore } from './notify-session-store';
import { stopActive } from './stop-active';
import { storeSlots } from './store-slots';
import type { ActiveSession, SessionSource } from './session-store.type';

const adoptSession = (next: ActiveSession, nextSource: SessionSource): void => {
  stopActive();
  storeSlots.session = next;
  storeSlots.source = nextSource;
  storeSlots.unsubscribeStatus = next.onStatusChange((status) => {
    const isCurrent = storeSlots.session === next;
    if (status === 'idle' && isCurrent) clearActive();
    if (status === 'error' && isCurrent && next.kind === 'online') dropOnlinePlacement();
    notifySessionStore();
  });
  notifySessionStore();
};

export { adoptSession };
