/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { lobbyWatch, resumeMemberships } from '@app/game/archipelia';
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';

const inLobby = (profile: Profile): boolean =>
  profile.randomizer?.mode === 'archipelia' || profile.randomizer?.origin === 'archipelia';

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
