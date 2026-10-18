/* @layer renderer-components @kind logic */
import type { SidePanelSide } from '@drizztdourden08/tessera/composites';

const sideSlotClass = (side: SidePanelSide, collapsed: boolean): string => [
  'controls-settings__side',
  `controls-settings__side--${side}`,
  !collapsed && 'controls-settings__side--open',
].filter(Boolean).join(' ');

export { sideSlotClass };
