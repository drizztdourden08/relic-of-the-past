/* @layer renderer-components @kind component */
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { Button } from '@drizztdourden08/tessera/primitives';
import { OPTIONS_PAGE, SHOW_ALL_LABEL } from './rotp-settings-panel.constants';

const RotpSettingsActions = ({ open }: RunPanelProps) => (
  <Button variant="secondary" size="sm" onClick={() => open(OPTIONS_PAGE)}>{SHOW_ALL_LABEL}</Button>
);

export { RotpSettingsActions };
