/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { checkLobby } from '@app/game/archipelia';
import type { LobbyCheck } from '@app/game/archipelia';
import { CHECK_DEBOUNCE_MS, IDLE_CHECK as IDLE } from './lobby-draft.constants';

const useLobbyCheck = (server: string | null, code: string | null): LobbyCheck => {
  const [check, setCheck] = useState<LobbyCheck>(IDLE);

  useEffect(() => {
    if (server === null || code === null) {
      setCheck(IDLE);
      return undefined;
    }
    let live = true;
    setCheck({ kind: 'checking' });
    const timer = setTimeout(() => {
      void checkLobby(server, code).then((next) => {
        if (live) setCheck(next);
      });
    }, CHECK_DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [server, code]);

  return check;
};

export { useLobbyCheck };
