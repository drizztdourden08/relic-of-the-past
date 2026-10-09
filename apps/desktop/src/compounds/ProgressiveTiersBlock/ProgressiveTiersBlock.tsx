/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { progressiveTickConsequences, unrollableTickSetReasons } from '@rotp/randomizer';
import { OptionDescription } from '../OptionDescription';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { progressiveCardsOf } from './behavior/progressive-cards';
import { withFamilyMode } from './behavior/with-family-mode';
import { withTierTicked } from './behavior/with-tier-ticked';
import { ProgressiveTierCard } from './sub-components/ProgressiveTierCard';
import { BLOCKED_LEAD, TIERS_CAPTION, TIERS_TITLE } from './ProgressiveTiersBlock.constants';
import type { ProgressiveTiersBlockProps } from './ProgressiveTiersBlock.type';
import './ProgressiveTiersBlock.css';

const ProgressiveTiersBlock = (props: ProgressiveTiersBlockProps) => {
  const { setting, modes, onChange, onModesChange } = props;
  const readOnly = onChange === undefined;
  const cards = progressiveCardsOf(setting, modes);
  const consequences = progressiveTickConsequences(setting);
  const blocked = unrollableTickSetReasons(setting);

  return (
    <Box className="progressive-tiers-block">
      <RandomizerOptionGroup title={TIERS_TITLE} live className="progressive-tiers-block__group">
        <Text className="progressive-tiers-block__caption">{TIERS_CAPTION}</Text>
        <Box className="progressive-tiers-block__cards">
          {cards.map((card) => (
            <ProgressiveTierCard
              key={card.id}
              card={card}
              disabled={readOnly}
              readout={readOnly}
              onTierChange={readOnly
                ? undefined
                : (index, checked) => onChange(withTierTicked(setting, card.id, index, checked))}
              onModeChange={onModesChange === undefined
                ? undefined
                : (mode) => onModesChange(withFamilyMode(modes, card.id, mode))}
            />
          ))}
        </Box>
        {consequences.length > 0 && (
          <OptionDescription
            description={consequences}
            className="progressive-tiers-block__consequences"
          />
        )}
        {blocked.length > 0 && (
          <Box className="progressive-tiers-block__blocked">
            <Text className="progressive-tiers-block__blocked-lead">{BLOCKED_LEAD}</Text>
            {blocked.map((reason) => (
              <Text key={reason} className="progressive-tiers-block__blocked-line">{reason}</Text>
            ))}
          </Box>
        )}
      </RandomizerOptionGroup>
    </Box>
  );
};

export { ProgressiveTiersBlock };
export type { ProgressiveTiersBlockProps };
