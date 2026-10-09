/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { RangeInput, Text } from '../../../../../../design-system/primitives';
import { CALIBRATION_STYLE, PERCENT } from './calibration-parts.constants';
import type { DeadzoneSliderProps } from './calibration-parts.type';

const DeadzoneSlider = (props: DeadzoneSliderProps) => {
  const { title, value, min, max, note, onChange } = props;
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value) / PERCENT),
    [onChange],
  );
  return (
    <Text as="label" style={CALIBRATION_STYLE.dzLabel}>
      <Text style={CALIBRATION_STYLE.dzRow}>
        <Text>{title}</Text>
        <Text style={CALIBRATION_STYLE.dzPct}>{(value * PERCENT).toFixed(0)}%</Text>
      </Text>
      <RangeInput min={min} max={max} value={value * PERCENT} style={CALIBRATION_STYLE.full} onChange={handleChange} />
      <Text style={CALIBRATION_STYLE.dzNote}>{note}</Text>
    </Text>
  );
};

export { DeadzoneSlider };
