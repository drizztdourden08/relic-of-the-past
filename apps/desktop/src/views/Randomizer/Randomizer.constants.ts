/* @layer renderer-components @kind constants */
import type { PanelPlacement } from './Randomizer.type';

const RANDOMIZER_BUCKET = 'randomizer';

const RUN_PANELS = {
  summary: { section: 'summary', span: 1 },
  progress: { section: 'progress', span: 1 },
  activity: { section: 'activity', span: 1 },
  players: { section: 'players', span: 2 },
  pool: { section: 'options-summary', span: 1 },
  settings: { section: 'options-settings', span: 2 },
} as const satisfies Record<string, PanelPlacement>;

const NO_RUN_PANEL: PanelPlacement = { section: 'run', span: 'full' };

const NOT_RANDOMIZED = 'This profile is not randomized. Randomizer options are chosen when creating a profile.';

const NOT_ARCHIPELAGO = 'This profile is not an Archipelago run. Network and Online settings apply to Archipelago profiles only.';

const NETWORK_PANELS = {
  setup: { section: 'setup', span: 1 },
  connection: { section: 'connection', span: 1 },
  health: { section: 'health', span: 1 },
  progress: { section: 'progress', span: 1 },
  players: { section: 'players', span: 2 },
  server: { section: 'server', span: 1 },
} as const satisfies Record<string, PanelPlacement>;

export { NETWORK_PANELS, RANDOMIZER_BUCKET, NO_RUN_PANEL, NOT_ARCHIPELAGO, NOT_RANDOMIZED, RUN_PANELS };
