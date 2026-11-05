/* @layer renderer-app @kind constants */
import type { ConnectionView } from '@drizztdourden08/brock-randomizer';
import { slotNameError } from '@drizztdourden08/brock-randomizer/archipelago';
import { NO_LOBBY_ERROR } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config/build-randomizer-config.constants';
import { ArchipeliaConnectionSlot } from '@app/views/Randomizer/sub-components/slots/ArchipeliaConnectionSlot';
import { rotpLobbyOfConnection } from './rotp-lobby-of-connection';

const ARCHIPELIA_CONNECTION: ConnectionView = {
  Body: ArchipeliaConnectionSlot,
  validate: (connection) => {
    const { lobby, lobbyCheck } = rotpLobbyOfConnection(connection);
    return slotNameError(lobby.slotName) ?? (lobbyCheck.kind === 'ok' ? null : NO_LOBBY_ERROR);
  },
  summary: (connection) => {
    const { lobby, lobbyCheck } = rotpLobbyOfConnection(connection);
    if (lobbyCheck.kind !== 'ok') return undefined;
    return lobby.seat === null ? lobbyCheck.name : `${lobbyCheck.name}, ${lobby.seat}`;
  },
};

export { ARCHIPELIA_CONNECTION };
