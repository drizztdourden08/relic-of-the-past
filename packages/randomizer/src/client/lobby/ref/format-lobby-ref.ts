/* @layer bridge-wasm @kind logic */
import { formatLobbyCode } from '@drizztdourden08/archipelia-lobby-protocol';
import type { LobbyRef } from '@drizztdourden08/archipelia-lobby-protocol';

const formatLobbyRef = (lobby: LobbyRef | undefined): LobbyRef | null => {
  if (lobby === undefined) return null;
  if (lobby.joinToken !== undefined) return { joinToken: lobby.joinToken };
  const code = formatLobbyCode(lobby.code);
  return code === null ? null : { code };
};

export { formatLobbyRef };
