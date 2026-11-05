/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { connectModeOf } from '@app/hooks/randomizer/lobby-setup';
import { rotpLobbyOf } from '@app/randomizer/lobby/rotp-lobby-of';
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';
import { CONNECT_LABELS, LOCATION_LABELS, NONE_LABEL } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { connectionFormOf } from './connection-form-of';

const lobbyRows = (values: ProfileWizardValues): FactsPanelFact[] => {
  const { lobby, lobbyCheck } = rotpLobbyOf(values);
  return [
    { label: 'Lobby on', value: LOCATION_LABELS[lobby.location] },
    { label: 'Connection', value: CONNECT_LABELS[connectModeOf(lobby)] },
    ...(lobbyCheck.kind === 'ok'
      ? [
        { label: 'Server', value: lobbyCheck.server, mono: true },
        ...(lobbyCheck.lobby.code === undefined ? [] : [{ label: 'Lobby code', value: lobbyCheck.lobby.code, mono: true }]),
        { label: 'Lobby', value: lobbyCheck.name },
        { label: 'Archipelago version', value: lobbyCheck.ap, mono: true },
      ]
      : []),
    { label: 'Seat', value: lobby.seat ?? 'Any open seat' },
    { label: 'Name', value: lobby.slotName.trim() || NONE_LABEL },
  ];
};

const serverRows = (values: ProfileWizardValues): FactsPanelFact[] => {
  const { host, port, slotName, hasPassword } = connectionFormOf(values);
  return [
    { label: 'Server', value: host.trim() === '' ? NONE_LABEL : `${host.trim()}:${port.trim()}`, mono: true },
    { label: 'Name', value: slotName.trim() || NONE_LABEL },
    { label: 'Password', value: hasPassword ? 'Set' : NONE_LABEL },
  ];
};

const connectionRows = (values: ProfileWizardValues): FactsPanelFact[] =>
  (wizardFactsOf(values).mode === 'archipelia' ? lobbyRows(values) : serverRows(values));

export { connectionRows };
