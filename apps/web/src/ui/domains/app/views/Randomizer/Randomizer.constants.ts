/* @layer renderer-components @kind constants */
/**
 * Every tab of the Randomizer page: its label and nav icon, whether it exists only for an
 * Archipelago profile, and whether it scrolls its own list. The nav and the page read this one
 * table, the way the profile hub reads PROFILE_HUB_TABS.
 */
import type { IconifyIcon } from '@iconify/react/offline';
import dicesIcon from '@iconify-icons/lucide/dices';
import scrollTextIcon from '@iconify-icons/lucide/scroll-text';
import listChecksIcon from '@iconify-icons/lucide/list-checks';
import networkIcon from '@iconify-icons/lucide/network';
import globeIcon from '@iconify-icons/lucide/globe';
import slidersHorizontalIcon from '@iconify-icons/lucide/sliders-horizontal';
import type { DashboardPanelProps } from '@ds/composites/DashboardGrid';
import type { SettingsPageAnchor } from '../../compounds/SettingsPage';

type RandomizerTab = 'run' | 'options' | 'network' | 'online' | 'logs' | 'spoiler';

/** A panel's place on a tab's dashboard: its anchor and its column span. */
type PanelPlacement = Required<Pick<DashboardPanelProps, 'section' | 'span'>>;

interface RandomizerTabSpec {
  label: string;
  navIcon: IconifyIcon;
  /** Listed only for an Archipelago profile. */
  archipelagoOnly?: boolean;
  /** False when the tab scrolls its own list (Options, Logs, Spoiler). */
  scroll?: boolean;
}

const RANDOMIZER_TABS: Record<RandomizerTab, RandomizerTabSpec> = {
  run: { label: 'Run', navIcon: dicesIcon },
  options: { label: 'Options', navIcon: slidersHorizontalIcon, scroll: false },
  logs: { label: 'Logs', navIcon: scrollTextIcon, scroll: false },
  spoiler: { label: 'Spoiler', navIcon: listChecksIcon, scroll: false },
  network: { label: 'Network', navIcon: networkIcon, archipelagoOnly: true },
  online: { label: 'Online', navIcon: globeIcon, archipelagoOnly: true },
};

/** The nav's groups, in order. */
const RANDOMIZER_NAV_GROUPS: { id: string; label: string; tabs: RandomizerTab[] }[] = [
  { id: 'run', label: 'Run', tabs: ['run', 'options', 'logs', 'spoiler'] },
  { id: 'archipelago', label: 'Archipelago', tabs: ['network', 'online'] },
];

/**
 * Where each Run page panel sits on the dashboard: its section anchor and how many columns
 * it takes. The one-column panels come first so they share the top row; the players table and
 * the settings tiles take two, and the item pool fills the column the players leave.
 */
const RUN_PANELS = {
  summary: { section: 'summary', span: 1 },
  progress: { section: 'progress', span: 1 },
  activity: { section: 'activity', span: 1 },
  players: { section: 'players', span: 2 },
  pool: { section: 'options-summary', span: 1 },
  settings: { section: 'options-settings', span: 2 },
} as const satisfies Record<string, PanelPlacement>;

/** The Run page's section links, in the panels' order; each id is a panel's `data-section`. */
const RUN_ANCHORS: SettingsPageAnchor[] = [
  { id: RUN_PANELS.summary.section, label: 'Summary' },
  { id: RUN_PANELS.progress.section, label: 'Progress' },
  { id: RUN_PANELS.activity.section, label: 'Recent activity' },
  { id: RUN_PANELS.players.section, label: 'Players' },
  { id: RUN_PANELS.pool.section, label: 'Options summary' },
];

/** A local seed has one player, whom the Progress section already covers, so its page has no Players section. */
const LOCAL_RUN_ANCHORS: SettingsPageAnchor[] = RUN_ANCHORS.filter((anchor) => anchor.id !== RUN_PANELS.players.section);

/** What the Run and Options pages say for a profile with no randomizer config. */
const NOT_RANDOMIZED = 'This profile is not randomized. Randomizer options are chosen when creating a profile.';

/**
 * Where each Network page panel sits: the server setup and the live connection share the top
 * row with its health and progress, then the players table takes two columns beside the
 * server's rules.
 */
const NETWORK_PANELS = {
  setup: { section: 'setup', span: 1 },
  connection: { section: 'connection', span: 1 },
  health: { section: 'health', span: 1 },
  progress: { section: 'progress', span: 1 },
  players: { section: 'players', span: 2 },
  server: { section: 'server', span: 1 },
} as const satisfies Record<string, PanelPlacement>;

/** The Network page's section links, in the panels' order. */
const NETWORK_ANCHORS: SettingsPageAnchor[] = [
  { id: NETWORK_PANELS.setup.section, label: 'Server setup' },
  { id: NETWORK_PANELS.connection.section, label: 'Connection' },
  { id: NETWORK_PANELS.health.section, label: 'Health' },
  { id: NETWORK_PANELS.progress.section, label: 'Progress' },
  { id: NETWORK_PANELS.players.section, label: 'Players' },
  { id: NETWORK_PANELS.server.section, label: 'Server' },
];

export { LOCAL_RUN_ANCHORS, NETWORK_ANCHORS, NETWORK_PANELS, NOT_RANDOMIZED, RANDOMIZER_NAV_GROUPS, RANDOMIZER_TABS, RUN_ANCHORS, RUN_PANELS };
export type { PanelPlacement, RandomizerTab, RandomizerTabSpec };
