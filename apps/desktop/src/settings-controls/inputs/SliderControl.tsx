/* @layer renderer-app @kind component */
import { Slider } from '@drizztdourden08/tessera/primitives';
import { useSettingLabel } from '../setting-label/useSettingLabel';
import type { SliderControlProps } from './inputs.type';

const SliderControl = (props: SliderControlProps) => {
  const { settingKey, value, min, max, step, onChange, format, disabled = false } = props;
  const label = useSettingLabel(settingKey);
  return <Slider value={value} min={min} max={max} step={step} formatValue={format} showValue onChange={onChange} disabled={disabled} aria-label={label} />;
};

export { SliderControl };
