/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Slider, StatRow, Text } from '@drizztdourden08/tessera/primitives';
import { shopCountControlOf } from '../behavior/shop-count-control';
import type { ShopSlotCountProps } from '../ShopSlotsBlock.type';
import './ShopSlotCount.css';

const ShopSlotCount = (props: ShopSlotCountProps) => {
  const { summary, disabled, readout = false, onChange } = props;
  const t = useT();
  const control = shopCountControlOf(summary, t);
  const label = t('compounds:shop-slots-block.slot-count-label');

  if (control.kind === 'readout' || readout) {
    return (
      <Box className="shop-slot-count" data-inert={disabled ? '' : undefined}>
        <StatRow label={label} value={control.value} />
        <Text className="shop-slot-count__description">{control.description}</Text>
      </Box>
    );
  }

  return (
    <Slider
      label={label}
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
