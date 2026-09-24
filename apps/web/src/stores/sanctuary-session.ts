/* @layer renderer-stores @kind logic */
/**
 * Who the app is signed in to the Sanctuary as. One store because two surfaces read it at
 * once: the Contributor tab (sign in, the code, sign out) and the bug report forms (the
 * reporter line, whether an email is asked). `refresh` runs at boot and after every sign-in
 * or sign-out; a token the site revoked reads as signed out on the next refresh.
 */
import { create } from 'zustand';
import type { SanctuaryMe, SanctuarySignInFailure } from '@shared/ipc';
import { getSanctuarySession } from '../lib/sanctuary/sanctuary-session';

type SanctuarySessionState = 'signed-out' | 'waiting' | 'signed-in';

const FAILURE_TEXT: Record<SanctuarySignInFailure, string> = {
  denied: 'The device was refused on the site.',
  expired: 'The code expired before it was confirmed.',
  cancelled: '',
  unavailable: 'This system cannot keep a sign-in encrypted.',
  error: 'Could not reach the Sanctuary.',
};

interface SanctuarySessionStore {
  me: SanctuaryMe | null;
  state: SanctuarySessionState;
  /** The code to type on the site while waiting; null otherwise. */
  userCode: string | null;
  lastError: string | null;
  refresh: () => Promise<void>;
  signIn: () => Promise<void>;
  cancel: () => Promise<void>;
  signOut: () => Promise<void>;
}

let unsubscribeCode: (() => void) | null = null;

const useSanctuarySessionStore = create<SanctuarySessionStore>((set, get) => ({
  me: null,
  state: 'signed-out',
  userCode: null,
  lastError: null,

  refresh: async () => {
    if (get().state === 'waiting') return;
    const me = await getSanctuarySession().me();
    set({ me, state: me ? 'signed-in' : 'signed-out' });
  },

  signIn: async () => {
    if (get().state === 'waiting') return;
    const session = getSanctuarySession();
    set({ state: 'waiting', userCode: null, lastError: null });
    unsubscribeCode?.();
    unsubscribeCode = session.subscribeDeviceCode((userCode) => set({ userCode }));
    const result = await session.signIn();
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
    await getSanctuarySession().cancel();
  },

  signOut: async () => {
    await getSanctuarySession().signOut();
    set({ me: null, state: 'signed-out', userCode: null, lastError: null });
  },
}));

export { useSanctuarySessionStore };
export type { SanctuarySessionStore, SanctuarySessionState };
