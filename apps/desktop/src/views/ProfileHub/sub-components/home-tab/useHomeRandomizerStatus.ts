/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { getSessionState, subscribeSessionStore } from '@app/game/randomizer-client';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SessionStoreState } from '@app/game/randomizer-client';
import type { HomeRandomizerStatus } from './home-tab.type';

const statusLabel = (status: 'idle' | 'starting' | 'active' | 'reconnecting' | 'error', t: I18n['t']): string => {
  switch (status) {
    case 'idle': return t('profiles:home.session.idle');
    case 'starting': return t('profiles:home.session.starting');
    case 'active': return t('profiles:home.session.active');
    case 'reconnecting': return t('profiles:home.session.reconnecting');
    case 'error': return t('profiles:home.session.error');
  }
};

const useHomeRandomizerStatus = (): HomeRandomizerStatus => {
  const t = useT();
  const [store, setStore] = useState<SessionStoreState>(getSessionState);

  useEffect(() => subscribeSessionStore(setStore), []);

  const { session } = store;
  return {
    sessionStatusLabel: session ? statusLabel(session.status, t) : t('profiles:home.session.not-started'),
  };
};

export { useHomeRandomizerStatus };
