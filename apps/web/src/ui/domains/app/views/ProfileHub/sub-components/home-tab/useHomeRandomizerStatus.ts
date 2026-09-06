/* @layer renderer-components @kind hook */
/**
 * Live randomizer session status for the home summary. Pure subscription —
 * the session store pushes status changes, so this hook adds no polling.
 * Checks progress deliberately does NOT come from here any more: the live
 * completed-checks subscription is empty while no game runs, which showed a
 * false zero — the per-save-file readout (useHomeSaveFileChecks) answers
 * for progress from the battery save on disk instead.
 */
import { useEffect, useState } from 'react';
import { getSessionState, subscribeSessionStore } from '@app/lib/game/randomizer-client';
import type { SessionStoreState } from '@app/lib/game/randomizer-client';

const STATUS_LABELS = {
  idle: 'Idle',
  starting: 'Starting…',
  active: 'Active',
  error: 'Error',
} as const;

interface HomeRandomizerStatus {
  sessionStatusLabel: string;
}

const useHomeRandomizerStatus = (): HomeRandomizerStatus => {
  const [store, setStore] = useState<SessionStoreState>(getSessionState);

  useEffect(() => subscribeSessionStore(setStore), []);

  const { session } = store;
  return {
    sessionStatusLabel: session ? STATUS_LABELS[session.status] : 'Not started',
  };
};

export { useHomeRandomizerStatus };
export type { HomeRandomizerStatus };
