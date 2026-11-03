/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { browseLobbies } from '@app/game/archipelia';
import type { BrowsedEntry } from '@app/game/archipelia';
import { BROWSE_REFRESH_MS, SERVER_KEY_SEPARATOR } from './lobby-draft.constants';

const useBrowsedLobbies = (servers: readonly string[]): BrowsedEntry[] => {
  const key = servers.join(SERVER_KEY_SEPARATOR);
  const [entries, setEntries] = useState<BrowsedEntry[]>([]);

  useEffect(() => {
    if (key === '') {
      setEntries([]);
      return undefined;
    }
    const list = key.split(SERVER_KEY_SEPARATOR);
    let live = true;
    const load = (): void => {
      void browseLobbies(list).then((next) => {
        if (live) setEntries(next);
      });
    };
    load();
    const timer = setInterval(load, BROWSE_REFRESH_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [key]);

  return entries;
};

export { useBrowsedLobbies };
