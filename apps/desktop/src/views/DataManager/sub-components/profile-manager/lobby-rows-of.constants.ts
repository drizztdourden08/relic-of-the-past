/* @layer renderer-components @kind constants */
import { LOBBY_DEFAULT_PORT } from '@rotp/randomizer';
import type { LobbyRow } from '@app/compounds/LobbySetup';
import { LOCAL_HOST, LOCAL_LOBBY_ID } from '@app/hooks/randomizer/lobby-setup';

const LOCAL_ROW: LobbyRow = {
  id: LOCAL_LOBBY_ID,
  name: 'Local lobby server',
  address: `${LOCAL_HOST}:${LOBBY_DEFAULT_PORT}`,
  supported: true,
  open: true,
};

export { LOCAL_ROW };
