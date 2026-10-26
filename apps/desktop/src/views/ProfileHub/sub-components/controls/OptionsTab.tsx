/* @layer renderer-components @kind component */
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { hapticsRows } from './haptics-rows';
import { requiredInputRows } from './required-input-rows';
import type { CtrlProps } from './controls.type';
import './OptionsTab.css';

const OptionsTab = ({ ctrl }: CtrlProps) => (
  <>
    <SettingsSection
      id="controls-haptics"
      title="Haptics"
      className="haptics-toggle"
      rows={hapticsRows(ctrl.hapticsEnabled, ctrl.setHapticsEnabled)}
    />
    <SettingsSection
      id="controls-required-inputs"
      title="Required inputs"
      className="controls-settings__used-inputs"
      rows={requiredInputRows(ctrl.requiredInputs)}
    />
  </>
);

export { OptionsTab };
