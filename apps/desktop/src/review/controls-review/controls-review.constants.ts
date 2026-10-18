/* @layer renderer-app @kind constants */
import type { SidePanelSide } from '@drizztdourden08/tessera/composites';

const CONTROLS_HUB = 'game';
const CONTROLS_SECTION = 'controls';

const CONTROLS_TABS = [
  { id: 'vanilla', label: 'Vanilla Controls' },
  { id: 'modern', label: 'Modern Controls' },
  { id: 'shortcuts', label: 'Shortcuts & Functions' },
  { id: 'cheats', label: 'Cheats' },
  { id: 'options', label: 'Options' },
] as const;

const ALL_TAB_IDS: readonly string[] = CONTROLS_TABS.map(({ id }) => id);

const NARROW_BOUNDS = { width: 600, height: 720 } as const;

const RECT_SLACK = 1;

const CONTROLS_SELECTORS = {
  page: '.controls-settings',
  main: '.controls-settings__main',
  tabs: '.controls-settings__main .tabs',
  body: '.controls-settings__body',
  tab: '.controls-settings__main [role="tab"]',
  panel: (side: SidePanelSide) => `.controls-settings__side--${side}`,
  toggle: '.side-panel__toggle',
  newProfile: 'button[aria-label="New profile"]',
  renameField: 'input[aria-label="Profile name"]',
  deleteProfile: '.list-item-row--selected button[aria-label="Delete profile"]',
  confirmDelete: '.dialog button',
} as const;

export { ALL_TAB_IDS, CONTROLS_HUB, CONTROLS_SECTION, CONTROLS_SELECTORS, CONTROLS_TABS, NARROW_BOUNDS, RECT_SLACK };
