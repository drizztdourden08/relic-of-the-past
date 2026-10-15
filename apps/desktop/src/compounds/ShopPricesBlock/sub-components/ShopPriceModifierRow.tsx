/* @layer renderer-components @kind component */
import { Box, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag } from '../../OptionValueTag';
import type { ShopPriceModifierRowProps } from './ShopPriceModifierRow.type';
import './ShopPriceModifierRow.css';

const percent = (value: number): string => `${value}%`;

const ShopPriceModifierRow = (props: ShopPriceModifierRowProps) => {
  const { label, value, min, max, disabled, readout = false, onChange } = props;

  return (
    <Box className={`shop-price-modifier-row${disabled ? ' shop-price-modifier-row--off' : ''}`}>
      <Text className="shop-price-modifier-row__label">{label}</Text>
      {readout ? <OptionValueTag value={percent(value)} /> : (
        <Slider
          value={value}
          min={min}
          max={max}
          step={5}
          disabled={disabled || onChange === undefined}
          formatValue={percent}
          onChange={(next) => onChange?.(next)}
        />
      )}
    </Box>
  );
};

export { ShopPriceModifierRow };
