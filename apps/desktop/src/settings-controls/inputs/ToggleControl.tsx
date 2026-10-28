/* @layer renderer-app @kind component */
import { Toggle } from '@drizztdourden08/tessera/primitives';
import { useSettingLabel } from '../setting-label/useSettingLabel';
import type { ToggleControlProps } from './inputs.type';

const ToggleControl = (props: ToggleControlProps) => {
  const { settingKey, value, onChange, disabled = false, label, hints } = props;
  const found = useSettingLabel(settingKey);
  const description = value ? hints?.on : hints?.off;
  const hint = description === undefined ? undefined : { label: value ? 'On' : 'Off', description };
  return <Toggle checked={value} onChange={onChange} disabled={disabled} hint={hint} aria-label={label ?? found} />;
};

export { ToggleControl };
