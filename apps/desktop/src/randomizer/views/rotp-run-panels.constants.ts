/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { RunPanelDef } from '@drizztdourden08/brock-randomizer';
import { RotpPoolPanel } from './RotpPoolPanel';
import { RotpSettingsActions } from './RotpSettingsActions';
import { RotpSettingsPanel } from './RotpSettingsPanel';

const ROTP_RUN_PANELS: readonly RunPanelDef[] = [
  { id: 'options-summary', title: msg('compounds:pool-side-panel.title'), span: 1, Body: RotpPoolPanel },
  { id: 'options-settings', title: msg('data-manager:profile-detail.tabs.settings'), span: 2, Body: RotpSettingsPanel, actions: RotpSettingsActions },
];

export { ROTP_RUN_PANELS };
