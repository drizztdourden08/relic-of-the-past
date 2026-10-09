/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { formatDialogSpeed, nearestStopIndex } from '@shared/game/dialog/pacing';
import { Slider } from '@drizztdourden08/tessera/primitives';
import type { DialogStopSliderProps } from './settings-controls.type';

const DialogStopSlider = (props: DialogStopSliderProps) => {
  const { stops, value, onChange, label, description, disabled = false, formatStop = formatDialogSpeed } = props;
  const stopAt = useCallback(
    (index: number): number => stops[Math.min(stops.length - 1, Math.max(0, Math.round(index)))],
    [stops],
  );
  const handleChange = useCallback((index: number) => onChange(stopAt(index)), [onChange, stopAt]);
  const formatValue = useCallback((index: number) => formatStop(stopAt(index)), [formatStop, stopAt]);
  return (
    <Slider
      label={label}
      description={description}
      value={nearestStopIndex(stops, value)}
      min={0}
      max={stops.length - 1}
      step={1}
      onChange={handleChange}
      formatValue={formatValue}
      disabled={disabled}
    />
  );
};

export { DialogStopSlider };
export type { DialogStopSliderProps };
