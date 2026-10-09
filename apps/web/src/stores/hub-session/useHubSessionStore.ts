/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { getHubSession } from '../../lib/hub/hub-session';
import type { HubSessionStore } from './hub-session.type';
import { FAILURE_TEXT } from './hub-session.constants';

let unsubscribeCode: (() => void) | null = null;

const useHubSessionStore = create<HubSessionStore>((set, get) => ({
  me: null,
  state: 'signed-out',
  userCode: null,
  lastError: null,

  refresh: async () => {
    if (get().state === 'waiting') return;
    const me = await getHubSession().me();
    set({ me, state: me ? 'signed-in' : 'signed-out' });
  },

  signIn: async (site) => {
    if (get().state === 'waiting') return;
    const session = getHubSession();
    set({ state: 'waiting', userCode: null, lastError: null });
    unsubscribeCode?.();
    unsubscribeCode = session.subscribeDeviceCode((userCode) => set({ userCode }));
    const result = await session.signIn(site);
    unsubscribeCode?.();
    unsubscribeCode = null;
    if (result.ok) {
      const me = await session.me();
      set({ me, state: me ? 'signed-in' : 'signed-out', userCode: null, lastError: me ? null : FAILURE_TEXT.error });
      return;
    }
    const text = result.message ?? FAILURE_TEXT[result.reason];
    set({ state: 'signed-out', userCode: null, lastError: text.length > 0 ? text : null });
  },

  cancel: async () => {
    await getHubSession().cancel();
  },

  signOut: async () => {
    await getHubSession().signOut();
    set({ me: null, state: 'signed-out', userCode: null, lastError: null });
  },
}));

export { useHubSessionStore };
