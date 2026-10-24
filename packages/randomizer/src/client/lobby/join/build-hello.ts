/* @layer bridge-wasm @kind logic */
import { PROTOCOL_NAME, SUPPORTED_PROTOCOL_VERSIONS, formatLobbyCode } from '@archipelia/lobby-protocol';
import type { Hello } from '@archipelia/lobby-protocol';
import { DEFAULT_CAPABILITIES } from '../lobby.constants';
import type { JoinConfig } from './join-config.type';
import type { PreparedJoin } from './prepared-join.type';

const buildHello = (config: JoinConfig, prepared: PreparedJoin, resume: string | null, seq: number): Hello => ({
  type: 'hello',
  seq,
  protocol: { name: PROTOCOL_NAME, versions: config.protocolVersions ?? SUPPORTED_PROTOCOL_VERSIONS },
  lobby: { code: formatLobbyCode(config.code) ?? config.code },
  resume,
  client: config.client,
  player: { displayName: config.displayName ?? config.slots[0]?.name ?? '' },
  archipelago: { version: config.archipelagoVersion },
  capabilities: config.capabilities ?? DEFAULT_CAPABILITIES,
  worlds: prepared.worlds,
  slots: prepared.slots,
});

export { buildHello };
