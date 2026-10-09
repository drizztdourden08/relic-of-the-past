/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { TURBO_SPEEDS, formatTurboSpeed, turboSpeedAt, turboSpeedIndex } from '@shared/display/turbo-speed';
import { Slider } from '../../../../../design-system/primitives/Slider';
import type { TurboSpeedControlProps } from './settings-controls.type';

const formatRung = (index: number) => formatTurboSpeed(turboSpeedAt(index));

const TurboSpeedControl = (props: TurboSpeedControlProps) => {
  const { value, onChange, disabled } = props;
  const handleChange = useCallback((index: number) => onChange(turboSpeedAt(index)), [onChange]);
  return (
    <Slider
      label="Turbo Speed"
      description="How much faster the game runs while the shortcut is held."
      value={turboSpeedIndex(value)}
      min={0}
      max={TURBO_SPEEDS.length - 1}
      step={1}
      onChange={handleChange}
      formatValue={formatRung}
      disabled={disabled}
    />
  );
};

export { TurboSpeedControl };
export type { TurboSpeedControlProps };
