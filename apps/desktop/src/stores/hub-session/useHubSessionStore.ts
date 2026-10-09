/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { useSignInStore } from '@drizztdourden08/brock-secrets/renderer';
import { SITE_IDS } from '@shared/hub/site-types';
import { fetchHubMe } from './fetch-hub-me';
import { signOutOfHub } from './sign-out-of-hub';
import type { HubSessionStore } from './hub-session.type';
import { LOOKUP_FAILED } from './hub-session.constants';

const signIns = () => useSignInStore.getState();

const useHubSessionStore = create<HubSessionStore>((set, get) => ({
  me: null,
  state: 'signed-out',
  userCode: null,
  lastError: null,

  refresh: async () => {
    if (get().state === 'waiting') return;
    const me = await fetchHubMe();
    set({ me, state: me ? 'signed-in' : 'signed-out' });
  },

  signIn: async (site = 'sanctuary') => {
    if (get().state === 'waiting') return;
    set({ state: 'waiting', userCode: null, lastError: null });
    const stopCodes = useSignInStore.subscribe((s) => {
      const userCode = s.entries[site]?.userCode ?? null;
      if (userCode !== get().userCode) set({ userCode });
    });
    const result = await signIns().begin(site);
    stopCodes();
    if (!result.ok) {
      set({ state: 'signed-out', userCode: null, lastError: signIns().entries[site]?.lastError ?? null });
      return;
    }
    const me = await fetchHubMe();
    set({ me, state: me ? 'signed-in' : 'signed-out', userCode: null, lastError: me ? null : LOOKUP_FAILED });
  },

  cancel: async () => {
    await Promise.all(SITE_IDS.map((site) => signIns().cancel(site)));
  },

  signOut: async () => {
    await signOutOfHub();
    for (const site of SITE_IDS) signIns().markSignedOut(site);
    set({ me: null, state: 'signed-out', userCode: null, lastError: null });
  },
}));

export { useHubSessionStore };
