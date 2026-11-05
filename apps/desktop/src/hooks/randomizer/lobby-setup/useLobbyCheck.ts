/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import type { LobbyRef } from '@drizztdourden08/brock-randomizer/archipelago';
import { checkLobby } from '@drizztdourden08/brock-randomizer/renderer';
import type { LobbyCheck } from '@drizztdourden08/brock-randomizer/renderer';
import { CHECK_DEBOUNCE_MS, IDLE_CHECK as IDLE } from './lobby-draft.constants';

const refOf = (code: string | undefined, joinToken: string | undefined): LobbyRef | null => {
  if (joinToken !== undefined) return { joinToken };
  return code === undefined ? null : { code };
};

const useLobbyCheck = (server: string | null, lobby: LobbyRef | null): LobbyCheck => {
  const [check, setCheck] = useState<LobbyCheck>(IDLE);
  const code = lobby?.code;
  const joinToken = lobby?.joinToken;

  useEffect(() => {
    const ref = refOf(code, joinToken);
    if (server === null || ref === null) {
      setCheck(IDLE);
      return undefined;
    }
    let live = true;
    setCheck({ kind: 'checking' });
    const timer = setTimeout(() => {
      void checkLobby(server, ref).then((next) => {
        if (live) setCheck(next);
      });
    }, CHECK_DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [server, code, joinToken]);

  return check;
};

export { useLobbyCheck };
