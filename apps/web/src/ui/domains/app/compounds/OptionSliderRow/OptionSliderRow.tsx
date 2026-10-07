/* @layer renderer-components @kind component */
/**
 * One setting asked as a slider: its name on the left, its short line under
 * the name when it has one, the slider in the catalog's own control track on
 * the right. Sitting the text on the same track the option rows use puts a
 * slider section and a catalog section on the same grid down the panel.
 *
 * Presentational only: the value comes in as a prop and every drag leaves as a
 * number. An absent handler renders the row frozen, which is both the
 * read-only face and how a row a sibling setting has emptied is shown.
 */
import { Box, Slider, Text } from '@ds/primitives';
import { OptionDescription } from '../OptionDescription';
import type { OptionDescription as OptionDescriptionText } from '@shared/randomizer/ap-world/option-description.type';
import './OptionSliderRow.css';

interface OptionSliderRowProps {
  label: string;
  /** The row's own short line; absent or empty leaves the name standing alone. */
  description?: OptionDescriptionText;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Frozen for a reason of its own, beside the one an absent handler gives. */
  disabled?: boolean;
  formatValue: (value: number) => string;
  onChange?: (value: number) => void;
}

const OptionSliderRow = (props: OptionSliderRowProps) => {
  const {
    label, description, value, min, max, step = 1, disabled = false, formatValue, onChange,
  } = props;

  return (
    <Box className="option-slider-row">
      <Box className="option-slider-row__text">
        <Text className="option-slider-row__label">{label}</Text>
        {description !== undefined && (
          <OptionDescription className="option-slider-row__description" description={description} />
        )}
      </Box>
      <Box className="option-slider-row__control">
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled || onChange === undefined}
          showValue
          formatValue={formatValue}
          onChange={(next) => onChange?.(next)}
        />
      </Box>
    </Box>
  );
};

export { OptionSliderRow };
export type { OptionSliderRowProps };
