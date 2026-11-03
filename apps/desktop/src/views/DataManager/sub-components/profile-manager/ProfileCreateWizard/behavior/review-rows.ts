/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { connectModeOf } from '@app/hooks/randomizer/lobby-setup';
import { snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { absorbPort, serverUrlOf } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { buildOptionFactGroups } from '../../profile-detail/build-option-facts';
import { RUN_TYPE_LABELS } from '../../profile-detail/build-run-facts.constants';
import { CONNECT_LABELS, DEFAULT_LANGUAGE_LABEL, LOCATION_LABELS, NO_MSU_LABEL, PRESET_OPTIONS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const NONE = 'None';

const profileRows = ({ name, rom, preset, language, msuPack }: ProfileWizardValues): FactsPanelFact[] => [
  { label: 'Profile Name', value: name.trim() },
  { label: 'ROM', value: rom, title: rom },
  { label: 'Preset', value: PRESET_OPTIONS.find((option) => option.value === preset)?.label ?? preset },
  { label: 'Language', value: language || DEFAULT_LANGUAGE_LABEL },
  { label: 'MSU Pack', value: msuPack || NO_MSU_LABEL },
];

const randomizerRows = ({ randomizer }: ProfileWizardValues): FactsPanelFact[] => [
  { label: 'Randomizer', value: randomizer.enabled ? 'On' : 'Off' },
  ...(randomizer.enabled
    ? [
      { label: 'Seed', value: randomizer.seed.trim(), mono: true },
      { label: 'Mode', value: RUN_TYPE_LABELS[randomizer.mode] },
    ]
    : []),
];

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
  { label: 'Name', value: lobby.slotName.trim() || NONE },
];

const serverRows = ({ server }: ProfileWizardValues['randomizer']): FactsPanelFact[] => [
  { label: 'Server', value: server.host.trim() === '' ? NONE : serverUrlOf(absorbPort(server)), mono: true },
  { label: 'Name', value: server.slotName.trim() || NONE },
  { label: 'Password', value: server.password === '' ? NONE : 'Set' },
];

const connectionRows = ({ randomizer }: ProfileWizardValues): FactsPanelFact[] =>
  (randomizer.mode === 'archipelia' ? lobbyRows(randomizer) : serverRows(randomizer));

const optionRows = ({ randomizer }: ProfileWizardValues): FactsPanelFact[] => {
  const rows = buildOptionFactGroups(snapshotOfChoices(randomizer))
    .flatMap(({ title, facts }) => facts.map((fact) => ({ ...fact, label: `${title}: ${fact.label}` })));
  return rows.length === 0 ? [{ label: 'Options', value: 'All at the default' }] : rows;
};

export { connectionRows, optionRows, profileRows, randomizerRows };
