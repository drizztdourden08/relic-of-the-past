/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { browseLobbies } from '@drizztdourden08/brock-randomizer/renderer';
import { BROWSE_REFRESH_MS, SERVER_KEY_SEPARATOR } from './lobby-draft.constants';
import type { BrowsedLobbies } from './browsed-lobbies.type';

const useBrowsedLobbies = (servers: readonly string[], refresh = 0): BrowsedLobbies => {
  const key = servers.join(SERVER_KEY_SEPARATOR);
  const [state, setState] = useState<BrowsedLobbies>({ entries: [], loading: false });

  useEffect(() => {
    if (key === '') {
      setState({ entries: [], loading: false });
      return undefined;
    }
    const list = key.split(SERVER_KEY_SEPARATOR);
    let live = true;
    setState((prev) => ({ ...prev, loading: true }));
    const load = (): void => {
      void browseLobbies(list).then((entries) => {
        if (live) setState({ entries, loading: false });
      });
    };
    load();
    const timer = setInterval(load, BROWSE_REFRESH_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [key, refresh]);

  return state;
};

export { useBrowsedLobbies };
