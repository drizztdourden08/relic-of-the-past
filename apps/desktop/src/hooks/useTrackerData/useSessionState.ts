/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { getSessionState, subscribeSessionStore } from '../../game/randomizer-client';
import type { SessionStoreState } from '../../game/randomizer-client';

const useSessionState = (): SessionStoreState => {
  const [state, setState] = useState(() => getSessionState());
  useEffect(() => subscribeSessionStore(setState), []);
  return state;
};

export { useSessionState };
