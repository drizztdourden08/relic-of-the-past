/* @layer bridge-wasm @kind logic */
import { withSeat } from '@drizztdourden08/archipelia-client-kit';
import { PROTOCOL_NAME, SUPPORTED_PROTOCOL_VERSIONS } from '@drizztdourden08/archipelia-lobby-protocol';
import type { Hello } from '@drizztdourden08/archipelia-lobby-protocol';
import { DEFAULT_CAPABILITIES } from '../lobby.constants';
import { formatLobbyRef } from '../ref/format-lobby-ref';
import type { JoinConfig } from './join-config.type';
import type { PreparedJoin } from './prepared-join.type';

const buildHello = (config: JoinConfig, prepared: PreparedJoin, resume: string | null, seq: number): Hello =>
  withSeat<Hello>({
    type: 'hello',
    seq,
    protocol: { name: PROTOCOL_NAME, versions: config.protocolVersions ?? SUPPORTED_PROTOCOL_VERSIONS },
    lobby: formatLobbyRef(config.lobby) ?? config.lobby,
    resume,
    client: config.client,
    player: { displayName: config.displayName ?? config.slots[0]?.name ?? '' },
    archipelago: { version: config.archipelagoVersion },
    capabilities: config.capabilities ?? DEFAULT_CAPABILITIES,
    worlds: prepared.worlds,
    slots: prepared.slots,
  }, config.seat);

export { buildHello };
