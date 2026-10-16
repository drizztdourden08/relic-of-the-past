/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { hapticsRows } from './haptics-rows';
import { requiredInputRows } from './required-input-rows';
import { REQUIRED_INPUTS_DESCRIPTION } from './controls.constants';
import type { CtrlProps } from './controls.type';
import './OptionsTab.css';

const OptionsTab = ({ ctrl }: CtrlProps) => (
  <Box className="controls-options">
    <SettingsSection
      id="controls-haptics"
      title="Haptics"
      className="haptics-toggle"
      rows={hapticsRows(ctrl.hapticsEnabled, ctrl.setHapticsEnabled)}
    />
    <SettingsSection
      id="controls-required-inputs"
      title="Required inputs"
      description={REQUIRED_INPUTS_DESCRIPTION}
      className="controls-settings__used-inputs"
      rows={requiredInputRows(ctrl.requiredInputs)}
    />
  </Box>
);

export { OptionsTab };
