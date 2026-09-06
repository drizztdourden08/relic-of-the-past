/* @layer renderer-components @kind component */
/**
 * One shop as a card: its name as a plain title, what it normally sells
 * underneath, and one box per slot below that.
 *
 * The slot boxes are the ONLY control here. A shop is on because something in
 * it is ticked and off because nothing is, so a whole-shop tick would be a
 * second way of saying what the boxes already say, and a card whose shop
 * starts unticked wears a badge instead, because "nothing ticked here"
 * otherwise looks like a setting that got lost.
 *
 * Presentational only: everything it draws arrives already derived
 * (behavior/shop-cards.ts), and every click leaves as a canonical index.
 *
 * "Nothing ticked" rides on its OWN attribute instead of on the state, so it
 * survives the inert face. A fresh profile opens on the mode that freezes the
 * whole block, and with the reading folded into the state the one shop that
 * starts with nothing ticked drew exactly like the ten that start full, which
 * is what made it look as though it had started ticked.
 */
import { Badge, Box, Checkbox, Text } from '@ds/primitives';
import type { ShopCardModel } from '../behavior/shop-cards';
import './ShopSlotCard.css';

interface ShopSlotCardProps {
  card: ShopCardModel;
  /** Vanilla mode or a read-only render: the card draws inert and takes no click. */
  disabled: boolean;
  onSlotChange?: (canonicalIndex: number, checked: boolean) => void;
}

const OFF_BY_DEFAULT_LABEL = 'Off by default';

/** Which of the three faces the card wears: inert, dimmed-out, or in play. */
const stateOf = (disabled: boolean, noneOn: boolean): string => {
  if (disabled) return 'disabled';
  return noneOn ? 'off' : 'on';
};

const ShopSlotCard = (props: ShopSlotCardProps) => {
  const { card, disabled, onSlotChange } = props;
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
          <Badge className="shop-slot-card__badge">{OFF_BY_DEFAULT_LABEL}</Badge>
        )}
      </Box>
      <Text className="shop-slot-card__stock">{stock}</Text>
      <Box className="shop-slot-card__slots">
        {slots.map((slot) => (
          <Checkbox
            key={slot.key}
            className="shop-slot-card__slot"
            label={slot.label}
            checked={slot.checked}
            disabled={disabled || onSlotChange === undefined}
            onChange={(next) => onSlotChange?.(slot.canonicalIndex, next)}
          />
        ))}
      </Box>
    </Box>
  );
};

export { ShopSlotCard };
export type { ShopSlotCardProps };
