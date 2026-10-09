/* @layer renderer-app @kind constants */
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { useSaveOverlayStore } from '@app/stores/save-overlay-store';
import { useUpdaterUiStore } from '@app/stores/updater-ui-store';
import { openShadowEditor } from './open-shadow-editor';

const checkForUpdates = (): void => {
  const updater = useUpdaterUiStore.getState();
  if (!updater.supported) return;
  updater.check?.();
  updater.setDialogOpen(true);
};

const ROTP_MENU: MenuEntry[] = [
  { key: 'save-states', label: 'Save States', description: 'Open the save state slots while the game runs.', onClick: () => useSaveOverlayStore.getState().toggle() },
  { key: 'check-updates', label: 'Check for Updates', onClick: checkForUpdates },
  { key: 'shadow-editor', label: 'Shadow Editor', section: 'advanced', devOnly: true, onClick: () => { void openShadowEditor(); } },
];

export { ROTP_MENU };
