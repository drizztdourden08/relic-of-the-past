/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { inLobby, lobbyWatch, resumeMemberships, useLobbyStatusStore } from '@drizztdourden08/brock-randomizer/renderer';

const useLobbyWatchBoot = (profiles: readonly Profile[]): void => {
  useEffect(() => {
    const kept = new Set(profiles.filter(inLobby).map((profile) => profile.id));
    for (const id of Object.keys(useLobbyStatusStore.getState().members)) {
      if (!kept.has(id)) lobbyWatch.forget(id);
    }
    void resumeMemberships(profiles);
  }, [profiles]);
};

export { useLobbyWatchBoot };
