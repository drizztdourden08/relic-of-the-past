/* @layer renderer-components @kind component */
/**
 * The percentage every rolled price is scaled by: its name in the block's
 * first track, one slider in the second, no opt-in, since a hundred per cent
 * already means "leave the ranges alone". It dims and freezes while no
 * currency is ticked: with nothing rolled there is no price to scale.
 */
import { Box, Slider, Text } from '@ds/primitives';
import './ShopPriceModifierRow.css';

interface ShopPriceModifierRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  /** No currency is ticked, or the whole section is frozen. */
  disabled: boolean;
  onChange?: (next: number) => void;
}

const percent = (value: number): string => `${value}%`;

const ShopPriceModifierRow = (props: ShopPriceModifierRowProps) => {
  const { label, value, min, max, disabled, onChange } = props;

  return (
    <Box className={`shop-price-modifier-row${disabled ? ' shop-price-modifier-row--off' : ''}`}>
      <Text className="shop-price-modifier-row__label">{label}</Text>
      <Slider
        value={value}
        min={min}
        max={max}
        step={5}
        disabled={disabled || onChange === undefined}
        formatValue={percent}
        onChange={(next) => onChange?.(next)}
      />
    </Box>
  );
};

export { ShopPriceModifierRow };
export type { ShopPriceModifierRowProps };
