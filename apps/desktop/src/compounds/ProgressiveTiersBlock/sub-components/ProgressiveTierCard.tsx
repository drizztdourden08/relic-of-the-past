/* @layer renderer-components @kind component */
import { Box, Checkbox, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { PROGRESSIVE_MODE_LABELS } from '@rotp/randomizer';
import type { ProgressiveFamilyMode } from '@rotp/randomizer';
import { OptionValueTag } from '../../OptionValueTag';
import { MODE_OPTIONS } from './ProgressiveTierCard.constants';
import type { ProgressiveTierCardProps } from './ProgressiveTierCard.type';
import './ProgressiveTierCard.css';

const stateOf = (disabled: boolean, noneOn: boolean): string => {
  if (disabled) return 'disabled';
  return noneOn ? 'off' : 'on';
};

const ProgressiveTierCard = (props: ProgressiveTierCardProps) => {
  const { card, disabled, readout = false, onTierChange, onModeChange } = props;
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
        {tiers.map((tier) => (readout ? (
          <OptionValueTag
            key={tier.key}
            className="progressive-tier-card__tier"
            label={tier.label}
            compact
            value={tier.checked}
          />
        ) : (
          <Checkbox
            key={tier.key}
            className="progressive-tier-card__tier"
            label={tier.label}
            checked={tier.checked}
            disabled={disabled || onTierChange === undefined}
            onChange={(next) => onTierChange?.(tier.index, next)}
          />
        )))}
      </Box>
      <Box className="progressive-tier-card__mode">
        {readout ? <OptionValueTag value={PROGRESSIVE_MODE_LABELS[mode]} /> : (
          <SegmentedControl<ProgressiveFamilyMode>
            value={mode}
            options={MODE_OPTIONS}
            disabled={disabled || noneOn || onModeChange === undefined}
            onChange={(next) => onModeChange?.(next)}
          />
        )}
      </Box>
    </Box>
  );
};

export { ProgressiveTierCard };
