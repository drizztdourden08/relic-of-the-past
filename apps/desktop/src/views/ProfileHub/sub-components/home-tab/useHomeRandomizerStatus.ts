/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { getSessionState, subscribeSessionStore } from '@app/game/randomizer-client';
import type { SessionStoreState } from '@app/game/randomizer-client';
import { STATUS_LABELS } from './home-tab.constants';
import type { HomeRandomizerStatus } from './home-tab.type';

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
