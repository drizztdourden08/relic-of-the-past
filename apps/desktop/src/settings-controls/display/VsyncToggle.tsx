/* @layer renderer-app @kind component */
import { useRefreshRate } from '@drizztdourden08/brock-display/renderer';
import { ToggleControl } from '../inputs';
import type { ControlContext } from '../settings-controls.type';

const VsyncToggle = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  useRefreshRate();
  return <ToggleControl settingKey="vsync" value={settings.vsync} onChange={(vsync) => onChange({ vsync })} disabled={disabled} />;
};

export { VsyncToggle };
