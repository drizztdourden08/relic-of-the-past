/* @layer renderer-components @kind component */
import { Status, Box, Checkbox, Text } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag } from '../../OptionValueTag';
import { OFF_BY_DEFAULT_LABEL } from '../ShopSlotsBlock.constants';
import type { ShopSlotCardProps } from '../ShopSlotsBlock.type';
import './ShopSlotCard.css';

const stateOf = (disabled: boolean, noneOn: boolean): string => {
  if (disabled) return 'disabled';
  return noneOn ? 'off' : 'on';
};

const ShopSlotCard = (props: ShopSlotCardProps) => {
  const { card, disabled, readout = false, onSlotChange } = props;
  const { name, stock, offByDefault, slots, noneOn } = card;

  return (
    <Box
      className="shop-slot-card"
      data-state={stateOf(disabled, noneOn)}
      data-empty={noneOn ? '' : undefined}
    >
      <Box className="shop-slot-card__head">
        <Text className="shop-slot-card__title">{name}</Text>
        {offByDefault && (
          <Status className="shop-slot-card__badge">{OFF_BY_DEFAULT_LABEL}</Status>
        )}
      </Box>
      <Text className="shop-slot-card__stock">{stock}</Text>
      <Box className="shop-slot-card__slots">
        {slots.map((slot) => (readout ? (
          <OptionValueTag
            key={slot.key}
            className="shop-slot-card__slot shop-slot-card__slot--readout"
            label={slot.label}
            value={slot.checked}
            compact
          />
        ) : (
          <Checkbox
            key={slot.key}
            className="shop-slot-card__slot"
            label={slot.label}
            checked={slot.checked}
            disabled={disabled || onSlotChange === undefined}
            onChange={(next) => onSlotChange?.(slot.canonicalIndex, next)}
          />
        )))}
      </Box>
    </Box>
  );
};

export { ShopSlotCard };
