/* @layer renderer-components @kind component */
import { Box, Slider, StatRow, Text } from '@ds/primitives';
import { shopCountControlOf } from '../behavior/shop-count-control';
import { SLOT_COUNT_LABEL } from '../ShopSlotsBlock.constants';
import type { ShopSlotCountProps } from '../ShopSlotsBlock.type';
import './ShopSlotCount.css';

const ShopSlotCount = (props: ShopSlotCountProps) => {
  const { summary, disabled, readout = false, onChange } = props;
  const control = shopCountControlOf(summary);

  if (control.kind === 'readout' || readout) {
    return (
      <Box className="shop-slot-count" data-inert={disabled ? '' : undefined}>
        <StatRow label={SLOT_COUNT_LABEL} value={control.value} />
        <Text className="shop-slot-count__description">{control.description}</Text>
      </Box>
    );
  }

  return (
    <Slider
      label={SLOT_COUNT_LABEL}
      description={control.description}
      value={control.value}
      min={0}
      max={control.max}
      disabled={disabled || onChange === undefined}
      onChange={(next) => onChange?.(next)}
    />
  );
};

export { ShopSlotCount };
export type { ShopSlotCountProps };
