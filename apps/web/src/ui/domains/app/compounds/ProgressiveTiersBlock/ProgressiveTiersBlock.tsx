/* @layer renderer-components @kind component */
/**
 * The tiered families, one card each, with a box per tier: the same shape the
 * shop block uses for its shelves, because it is the same question, which of a
 * fixed set of slots are in the seed.
 *
 * Under the grid the block says what the ticks have DONE to the world. Emptying
 * the blade family, or leaving only the rung that throws no beam, relaxes five
 * rules that would otherwise have no answer: the tablets, the medallion doors,
 * a hanging cloth door, the tower's seal and the last fight. Each of those is a
 * line here and only while it is true, so the default set says nothing and a
 * bladeless one says exactly what changed.
 *
 * The block also says when a tick set cannot be rolled at all. Two rungs are
 * load-bearing under the rules this version transcribes, and the generator
 * refuses without them; saying so here, live, is the difference between a
 * setting the player can reason about and a seed that fails at create time
 * with no explanation. Both readings are derived, never stored: they follow
 * the ticks as they are edited.
 *
 * Presentational only: the setting comes in as a prop and every edit leaves as
 * a whole new setting. An absent handler renders the whole block frozen, which
 * is the read-only face the run view shows.
 */
import { Box, Text } from '@ds/primitives';
import { progressiveTickConsequences } from '@shared/randomizer/ap-world/progressive/tick-consequences';
import { unrollableTickSetReasons } from '@shared/randomizer/ap-world/progressive/tick-set-check';
import { OptionDescription } from '../OptionDescription';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { progressiveCardsOf } from './behavior/progressive-cards';
import { withFamilyMode, withTierTicked } from './behavior/progressive-tick-edits';
import { ProgressiveTierCard } from './sub-components/ProgressiveTierCard';
import { BLOCKED_LEAD, TIERS_CAPTION, TIERS_TITLE } from './ProgressiveTiersBlock.constants';
import type {
  ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/ap-world/progressive/progressive.type';
import './ProgressiveTiersBlock.css';

interface ProgressiveTiersBlockProps {
  setting: ProgressiveSetting;
  /** How each family's copies arrive: in order, or the rungs themselves. */
  modes: ProgressiveModeSetting;
  /** Absent renders the whole block frozen. */
  onChange?: (next: ProgressiveSetting) => void;
  /** Absent freezes the order controls alone. */
  onModesChange?: (next: ProgressiveModeSetting) => void;
}

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
