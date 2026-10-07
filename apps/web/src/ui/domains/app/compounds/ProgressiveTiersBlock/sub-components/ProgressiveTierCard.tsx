/* @layer renderer-components @kind component */
/**
 * One progressive family as a card: its name as a plain title, what the ticks
 * add up to underneath, one box per rung below that, and the order question
 * for the family at the foot.
 *
 * The rung boxes are the only tick control here. A family is in the seed
 * because something is ticked and out of it because nothing is, so a
 * whole-family tick would be a second way of saying what the boxes already
 * say, and a card with nothing ticked wears a dashed edge instead, because
 * "this family is gone" otherwise looks like a card that failed to draw.
 *
 * The order control sits below the boxes instead of above them because it
 * only means anything once something is ticked: with the family emptied out it
 * has no copies to order, so it draws inert.
 *
 * Presentational only: everything it draws arrives already derived
 * (behavior/progressive-cards.ts), and every click leaves as a rung index or a
 * mode.
 */
import { Box, Checkbox, SegmentedControl, Text } from '@ds/primitives';
import { PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS } from '@shared/randomizer/ap-world/progressive/progressive-modes.data';
import type { ProgressiveFamilyMode } from '@shared/randomizer/ap-world/progressive/progressive.type';
import type { SegmentOption } from '@ds/primitives';
import type { ProgressiveCardModel } from '../behavior/progressive-cards';
import './ProgressiveTierCard.css';

interface ProgressiveTierCardProps {
  card: ProgressiveCardModel;
  /** A read-only render: every control draws inert. */
  disabled: boolean;
  onTierChange?: (index: number, checked: boolean) => void;
  onModeChange?: (mode: ProgressiveFamilyMode) => void;
}

const MODE_OPTIONS: SegmentOption<ProgressiveFamilyMode>[] = PROGRESSIVE_MODES.map((mode) => ({
  value: mode,
  label: PROGRESSIVE_MODE_LABELS[mode],
}));

/** Which of the three faces the card wears: inert, emptied out, or in play. */
const stateOf = (disabled: boolean, noneOn: boolean): string => {
  if (disabled) return 'disabled';
  return noneOn ? 'off' : 'on';
};

const ProgressiveTierCard = (props: ProgressiveTierCardProps) => {
  const { card, disabled, onTierChange, onModeChange } = props;
  const { name, countText, tiers, noneOn, mode } = card;

  return (
    <Box
      className="progressive-tier-card"
      data-state={stateOf(disabled, noneOn)}
      data-empty={noneOn ? '' : undefined}
    >
      <Text className="progressive-tier-card__title">{name}</Text>
      <Text className="progressive-tier-card__count">{countText}</Text>
      <Box className="progressive-tier-card__tiers">
        {tiers.map((tier) => (
          <Checkbox
            key={tier.key}
            className="progressive-tier-card__tier"
            label={tier.label}
            checked={tier.checked}
            disabled={disabled || onTierChange === undefined}
            onChange={(next) => onTierChange?.(tier.index, next)}
          />
        ))}
      </Box>
      <Box className="progressive-tier-card__mode">
        <SegmentedControl<ProgressiveFamilyMode>
          value={mode}
          options={MODE_OPTIONS}
          disabled={disabled || noneOn || onModeChange === undefined}
          onChange={(next) => onModeChange?.(next)}
        />
      </Box>
    </Box>
  );
};

export { ProgressiveTierCard };
export type { ProgressiveTierCardProps };
