/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { connectModeOf } from '@app/hooks/randomizer/lobby-setup';
import { absorbPort, serverUrlOf } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { CONNECT_LABELS, LOCATION_LABELS, NONE_LABEL } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const lobbyRows = ({ lobby, lobbyCheck }: ProfileWizardValues['randomizer']): FactsPanelFact[] => [
  { label: 'Lobby on', value: LOCATION_LABELS[lobby.location] },
  { label: 'Connection', value: CONNECT_LABELS[connectModeOf(lobby)] },
  ...(lobbyCheck.kind === 'ok'
    ? [
      { label: 'Server', value: lobbyCheck.server, mono: true },
      { label: 'Lobby code', value: lobbyCheck.code, mono: true },
      { label: 'Lobby', value: lobbyCheck.name },
      { label: 'Archipelago version', value: lobbyCheck.ap, mono: true },
    ]
    : []),
  { label: 'Seat', value: lobby.seat ?? 'Any open seat' },
  { label: 'Name', value: lobby.slotName.trim() || NONE_LABEL },
];

const serverRows = ({ server }: ProfileWizardValues['randomizer']): FactsPanelFact[] => [
  { label: 'Server', value: server.host.trim() === '' ? NONE_LABEL : serverUrlOf(absorbPort(server)), mono: true },
  { label: 'Name', value: server.slotName.trim() || NONE_LABEL },
  { label: 'Password', value: server.password === '' ? NONE_LABEL : 'Set' },
];

const connectionRows = ({ randomizer }: ProfileWizardValues): FactsPanelFact[] =>
  (randomizer.mode === 'archipelia' ? lobbyRows(randomizer) : serverRows(randomizer));

export { connectionRows };
