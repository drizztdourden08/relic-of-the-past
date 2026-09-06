/* @layer renderer-components @kind component */
/**
 * The difficulty block: how many copies of each tiered family the seed
 * carries, and how high the hearts climb. It stands directly under the tier
 * cards because it is the second half of the same question: the cards say
 * WHICH rungs a family has, these say how many times over the seed carries
 * them.
 *
 * Each row is a name, the catalog's short line when it has one, and a slider.
 * A family whose rungs were all unticked above carries no copy at all, so its
 * control is shown inert with the reason on it rather than live and
 * pointless, the same rule the retro costs follow under their own switch.
 *
 * Presentational only: the setting comes in as a prop and every edit leaves as
 * a whole new setting. An absent handler renders the block frozen, which is
 * the read-only face the run view shows.
 */
import { Box, Text } from '@ds/primitives';
import {
  COPY_MULTIPLIERS, COPY_MULTIPLIER_LABELS, MAX_HEART_CAP, STARTING_HEARTS, asCopyMultiplier,
} from '@shared/randomizer/ap-world/difficulty/difficulty.data';
import { HEART_CAP_KEY, difficultyCopiesKeyOf } from '@shared/randomizer/ap-world/difficulty/difficulty-option-keys';
import { PROGRESSIVE_FAMILIES } from '@shared/randomizer/ap-world/progressive/progressive-families.data';
import { progressiveFamilyName } from '@shared/randomizer/ap-world/progressive/progressive-display-names';
import { tickedCountOf } from '@shared/randomizer/ap-world/progressive/progressive-reach';
import { apOptionByKey } from '@shared/randomizer/ap-world/options.data';
import { OptionSliderRow } from '../OptionSliderRow';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import {
  DIFFICULTY_CAPTION, DIFFICULTY_COPIES_HEADING, DIFFICULTY_HEARTS_HEADING, DIFFICULTY_TITLE, NO_RUNGS_NOTE,
} from './DifficultyBlock.constants';
import type { DifficultyBlockProps } from './DifficultyBlock.type';
import './DifficultyBlock.css';

const FIRST_STEP = COPY_MULTIPLIERS[0];
const LAST_STEP = COPY_MULTIPLIERS[COPY_MULTIPLIERS.length - 1];

const descriptionOf = (key: string) => apOptionByKey.get(key)?.description ?? '';
const multipleLabel = (value: number): string => COPY_MULTIPLIER_LABELS[asCopyMultiplier(value)];
const heartLabel = (value: number): string => `${value} hearts`;

const DifficultyBlock = (props: DifficultyBlockProps) => {
  const { setting, tiers, onChange } = props;
  const readOnly = onChange === undefined;

  return (
    <RandomizerOptionGroup title={DIFFICULTY_TITLE} live className="difficulty-block">
      <Text className="difficulty-block__caption">{DIFFICULTY_CAPTION}</Text>
      <Text className="difficulty-block__heading">{DIFFICULTY_COPIES_HEADING}</Text>
      <Box className="difficulty-block__copies">
        {PROGRESSIVE_FAMILIES.map((family) => {
          const rungs = tickedCountOf(tiers, family.id);
          return (
            <OptionSliderRow
              key={family.id}
              label={progressiveFamilyName(family)}
              description={rungs === 0
                ? NO_RUNGS_NOTE
                : descriptionOf(difficultyCopiesKeyOf(family.id))}
              value={setting.copies[family.id]}
              min={FIRST_STEP}
              max={LAST_STEP}
              disabled={readOnly || rungs === 0}
              formatValue={multipleLabel}
              onChange={(value) => onChange?.({
                ...setting,
                copies: { ...setting.copies, [family.id]: asCopyMultiplier(value) },
              })}
            />
          );
        })}
      </Box>
      <Text className="difficulty-block__heading">{DIFFICULTY_HEARTS_HEADING}</Text>
      <OptionSliderRow
        label={apOptionByKey.get(HEART_CAP_KEY)?.displayName ?? HEART_CAP_KEY}
        description={descriptionOf(HEART_CAP_KEY)}
        value={setting.heartCap}
        min={STARTING_HEARTS}
        max={MAX_HEART_CAP}
        disabled={readOnly}
        formatValue={heartLabel}
        onChange={(heartCap) => onChange?.({ ...setting, heartCap })}
      />
    </RandomizerOptionGroup>
  );
};

export { DifficultyBlock };
