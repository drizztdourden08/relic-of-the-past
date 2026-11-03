/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ArchipeliaMembership } from '@app/game/archipelia';

const buildLobbyFacts = (membership: ArchipeliaMembership, slotName: string): FactsPanelFact[] => [
  { label: 'Server', value: membership.server, mono: true },
  { label: 'Lobby', value: membership.lobbyName },
  ...(membership.lobby.code === undefined ? [] : [{ label: 'Code', value: membership.lobby.code, mono: true, copyable: true }]),
  { label: 'Archipelago', value: membership.ap, mono: true },
  { label: 'Slot', value: slotName },
];

export { buildLobbyFacts };
