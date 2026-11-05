/* @layer renderer-components @kind constants */
import type { RunPanelDef } from '@drizztdourden08/brock-randomizer';
import { RotpPoolPanel } from './RotpPoolPanel';
import { RotpSettingsPanel } from './RotpSettingsPanel';

const ROTP_RUN_PANELS: readonly RunPanelDef[] = [
  { id: 'options-summary', title: 'Item pool', span: 1, Body: RotpPoolPanel },
  { id: 'options-settings', title: 'Settings', span: 2, Body: RotpSettingsPanel },
];

export { ROTP_RUN_PANELS };
