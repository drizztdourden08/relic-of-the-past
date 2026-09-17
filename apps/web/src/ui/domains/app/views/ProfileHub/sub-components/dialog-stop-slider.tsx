/* @layer renderer-components @kind component */
/**
 * One slider over a ladder of stops. The stops are not evenly spaced (1x, 1.5x, 2x ... then
 * instant), so the range input walks the ladder by index and the label shows the stop at that
 * index. Shared by the text speed, hold speed and font size rows.
 */
import { formatDialogSpeed, nearestStopIndex } from '@shared/game/dialog/pacing';
import { Slider } from '../../../../../design-system/primitives/Slider';

interface DialogStopSliderProps {
  /** The ladder to walk, in slider order. */
  stops: readonly number[];
  /** The stored stop; an off-ladder value snaps to the nearest stop. */
  value: number;
  onChange: (stop: number) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  /** Display form of a stop. Defaults to the pacing form: Original, Instant, or "1.5x". */
  formatStop?: (stop: number) => string;
}

const DialogStopSlider = (props: DialogStopSliderProps) => {
  const { stops, value, onChange, label, description, disabled = false, formatStop = formatDialogSpeed } = props;
  const stopAt = (index: number): number => stops[Math.min(stops.length - 1, Math.max(0, Math.round(index)))];
  return (
    <Slider
      label={label}
      description={description}
      value={nearestStopIndex(stops, value)}
      min={0}
      max={stops.length - 1}
      step={1}
      onChange={(index) => onChange(stopAt(index))}
      formatValue={(index) => formatStop(stopAt(index))}
      disabled={disabled}
    />
  );
};

export { DialogStopSlider };
export type { DialogStopSliderProps };
