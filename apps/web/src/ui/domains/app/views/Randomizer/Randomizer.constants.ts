/* @layer renderer-components @kind constants */
import dicesIcon from '@iconify-icons/lucide/dices';
import scrollTextIcon from '@iconify-icons/lucide/scroll-text';
import listChecksIcon from '@iconify-icons/lucide/list-checks';
import networkIcon from '@iconify-icons/lucide/network';
import globeIcon from '@iconify-icons/lucide/globe';
import slidersHorizontalIcon from '@iconify-icons/lucide/sliders-horizontal';
import type { SettingsPageAnchor } from '../../compounds/SettingsPage';
import type { PanelPlacement, RandomizerNavGroup, RandomizerTab, RandomizerTabSpec } from './Randomizer.type';

const RANDOMIZER_TABS: Record<RandomizerTab, RandomizerTabSpec> = {
  run: { label: 'Run', navIcon: dicesIcon },
  options: { label: 'Options', navIcon: slidersHorizontalIcon, scroll: false },
  logs: { label: 'Logs', navIcon: scrollTextIcon, scroll: false },
  spoiler: { label: 'Spoiler', navIcon: listChecksIcon, scroll: false },
  network: { label: 'Network', navIcon: networkIcon, archipelagoOnly: true },
  online: { label: 'Online', navIcon: globeIcon, archipelagoOnly: true },
};

const RANDOMIZER_NAV_GROUPS: RandomizerNavGroup[] = [
  { id: 'run', label: 'Run', tabs: ['run', 'options', 'logs', 'spoiler'] },
  { id: 'archipelago', label: 'Archipelago', tabs: ['network', 'online'] },
];

const RUN_PANELS = {
  summary: { section: 'summary', span: 1 },
  progress: { section: 'progress', span: 1 },
  activity: { section: 'activity', span: 1 },
  players: { section: 'players', span: 2 },
  pool: { section: 'options-summary', span: 1 },
  settings: { section: 'options-settings', span: 2 },
} as const satisfies Record<string, PanelPlacement>;

const RUN_ANCHORS: SettingsPageAnchor[] = [
  { id: RUN_PANELS.summary.section, label: 'Summary' },
  { id: RUN_PANELS.progress.section, label: 'Progress' },
  { id: RUN_PANELS.activity.section, label: 'Recent activity' },
  { id: RUN_PANELS.players.section, label: 'Players' },
  { id: RUN_PANELS.pool.section, label: 'Options summary' },
];

const LOCAL_RUN_ANCHORS: SettingsPageAnchor[] = RUN_ANCHORS.filter((anchor) => anchor.id !== RUN_PANELS.players.section);

const NOT_RANDOMIZED = 'This profile is not randomized. Randomizer options are chosen when creating a profile.';

const NETWORK_PANELS = {
  setup: { section: 'setup', span: 1 },
  connection: { section: 'connection', span: 1 },
  health: { section: 'health', span: 1 },
  progress: { section: 'progress', span: 1 },
  players: { section: 'players', span: 2 },
  server: { section: 'server', span: 1 },
} as const satisfies Record<string, PanelPlacement>;

const NETWORK_ANCHORS: SettingsPageAnchor[] = [
  { id: NETWORK_PANELS.setup.section, label: 'Server setup' },
  { id: NETWORK_PANELS.connection.section, label: 'Connection' },
  { id: NETWORK_PANELS.health.section, label: 'Health' },
  { id: NETWORK_PANELS.progress.section, label: 'Progress' },
  { id: NETWORK_PANELS.players.section, label: 'Players' },
  { id: NETWORK_PANELS.server.section, label: 'Server' },
];

export { LOCAL_RUN_ANCHORS, NETWORK_ANCHORS, NETWORK_PANELS, NOT_RANDOMIZED, RANDOMIZER_NAV_GROUPS, RANDOMIZER_TABS, RUN_ANCHORS, RUN_PANELS };
