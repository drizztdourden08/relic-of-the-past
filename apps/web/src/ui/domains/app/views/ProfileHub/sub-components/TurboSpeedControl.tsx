/* @layer renderer-components @kind component */
/**
 * The turbo speed slider. The rungs are not evenly spaced (1.25x to 10x, widening as they climb),
 * so the range input walks the ladder by index and the label shows the multiplier at that rung.
 */
import { TURBO_SPEEDS, formatTurboSpeed, turboSpeedAt, turboSpeedIndex } from '@shared/display/turbo-speed';
import { Slider } from '../../../../../design-system/primitives/Slider';

interface TurboSpeedControlProps {
  value: number;
  onChange: (speed: number) => void;
}

const TurboSpeedControl = (props: TurboSpeedControlProps) => {
  const { value, onChange } = props;
  return (
    <Slider
      label="Turbo Speed"
      description="How much faster the game runs while the shortcut is held."
      value={turboSpeedIndex(value)}
      min={0}
      max={TURBO_SPEEDS.length - 1}
      step={1}
      onChange={(index) => onChange(turboSpeedAt(index))}
      formatValue={(index) => formatTurboSpeed(turboSpeedAt(index))}
    />
  );
};

export { TurboSpeedControl };
export type { TurboSpeedControlProps };
