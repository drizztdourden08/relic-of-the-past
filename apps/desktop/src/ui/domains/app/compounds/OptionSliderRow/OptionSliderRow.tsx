/* @layer renderer-components @kind component */
import { Box, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { OptionDescription } from '../OptionDescription';
import { OptionValueTag } from '../OptionValueTag';
import type { OptionSliderRowProps } from './OptionSliderRow.type';
import './OptionSliderRow.css';

const OptionSliderRow = (props: OptionSliderRowProps) => {
  const {
    label, description, value, min, max, step = 1, disabled = false, formatValue, onChange, readout = false,
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
        {readout ? <OptionValueTag value={formatValue(value)} /> : (
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
        )}
      </Box>
    </Box>
  );
};

export { OptionSliderRow };
export type { OptionSliderRowProps };
