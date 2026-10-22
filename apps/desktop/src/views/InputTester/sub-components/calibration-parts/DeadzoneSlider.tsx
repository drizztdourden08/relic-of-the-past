/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Slider } from '@drizztdourden08/tessera/primitives';
import { PERCENT } from './calibration-parts.constants';
import type { DeadzoneSliderProps } from './calibration-parts.type';

const formatPercent = (v: number): string => `${v.toFixed(0)}%`;

const DeadzoneSlider = (props: DeadzoneSliderProps) => {
  const { title, value, min, max, note, onChange } = props;
  const handleChange = useCallback((v: number) => onChange(v / PERCENT), [onChange]);

  return (
    <Slider
      label={title}
      description={note}
      min={min}
      max={max}
      value={value * PERCENT}
      showValue
      formatValue={formatPercent}
      onChange={handleChange}
    />
  );
};

export { DeadzoneSlider };
