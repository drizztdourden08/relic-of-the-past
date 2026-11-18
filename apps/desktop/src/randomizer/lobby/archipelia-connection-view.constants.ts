/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ConnectionView } from '@drizztdourden08/brock-randomizer';
import { slotNameError } from '@drizztdourden08/brock-randomizer/archipelago';
import { textOf } from '@app/shell/text-bridge';
import { ArchipeliaConnectionSlot } from '@app/views/Randomizer/sub-components/slots/ArchipeliaConnectionSlot';
import { rotpLobbyOfConnection } from './rotp-lobby-of-connection';

const NO_LOBBY_ERROR = msg('views-randomizer:lobby.no-lobby');

const ARCHIPELIA_CONNECTION: ConnectionView = {
  Body: ArchipeliaConnectionSlot,
  validate: (connection) => {
    const { lobby, lobbyCheck } = rotpLobbyOfConnection(connection);
    return slotNameError(lobby.slotName) ?? (lobbyCheck.kind === 'ok' ? null : textOf(NO_LOBBY_ERROR));
  },
  summary: (connection) => {
    const { lobby, lobbyCheck } = rotpLobbyOfConnection(connection);
    if (lobbyCheck.kind !== 'ok') return undefined;
    return lobby.seat === null ? lobbyCheck.name : `${lobbyCheck.name}, ${lobby.seat}`;
  },
};

export { ARCHIPELIA_CONNECTION };
