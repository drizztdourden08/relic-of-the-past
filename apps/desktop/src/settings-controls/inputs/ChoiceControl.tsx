/* @layer renderer-app @kind component */
import { SegmentedControl, Select } from '@drizztdourden08/tessera/primitives';
import { useSettingLabel } from '../setting-label/useSettingLabel';
import type { ChoiceControlProps } from './inputs.type';

const ChoiceControl = (props: ChoiceControlProps) => {
  const { settingKey, value, options, onChange, look, disabled = false } = props;
  const label = useSettingLabel(settingKey);
  const choices = [...options];
  if (look === 'select') return <Select value={value} onChange={onChange} options={choices} disabled={disabled} aria-label={label} />;
  return <SegmentedControl value={value} onChange={onChange} options={choices} disabled={disabled} aria-label={label} />;
};

export { ChoiceControl };
