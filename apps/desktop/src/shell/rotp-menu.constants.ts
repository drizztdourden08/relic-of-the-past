/* @layer renderer-app @kind constants */
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { useSaveOverlayStore } from '@app/stores/save-overlay-store';

const ROTP_MENU: MenuEntry[] = [
  { key: 'save-states', label: 'Save States', description: 'Open the save state slots while the game runs.', onClick: () => useSaveOverlayStore.getState().toggle() },
];

export { ROTP_MENU };
