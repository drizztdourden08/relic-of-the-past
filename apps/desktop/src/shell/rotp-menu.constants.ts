/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { MenuEntryDef } from '@drizztdourden08/brock-react';
import { useSaveOverlayStore } from '@app/stores/save-overlay-store';

const ROTP_MENU: MenuEntryDef[] = [
  { key: 'save-states', label: msg('views-game-layer:menu.save-states'), description: msg('views-game-layer:menu.save-states-description'), onClick: () => useSaveOverlayStore.getState().toggle() },
];

export { ROTP_MENU };
