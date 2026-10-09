/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import {
  COPY_MULTIPLIER_LABELS, MAX_HEART_CAP, STARTING_HEARTS, asCopyMultiplier,
} from '@shared/randomizer/world/difficulty/difficulty.data';
import { HEART_CAP_KEY, difficultyCopiesKeyOf } from '@shared/randomizer/world/difficulty/difficulty-option-keys';
import { PROGRESSIVE_FAMILIES } from '@shared/randomizer/world/progressive/progressive-families.data';
import { progressiveFamilyName } from '@shared/randomizer/world/progressive/progressive-display-names';
import { tickedCountOf } from '@shared/randomizer/world/progressive/progressive-reach';
import { optionByKey } from '@shared/randomizer/world/options.data';
import { OptionSliderRow } from '../OptionSliderRow';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import {
  DIFFICULTY_CAPTION, DIFFICULTY_COPIES_HEADING, DIFFICULTY_HEARTS_HEADING, DIFFICULTY_TITLE, FIRST_STEP, LAST_STEP,
  NO_RUNGS_NOTE,
} from './DifficultyBlock.constants';
import type { DifficultyBlockProps } from './DifficultyBlock.type';
import './DifficultyBlock.css';

const descriptionOf = (key: string) => optionByKey.get(key)?.description ?? '';
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
              readout={readOnly}
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
        label={optionByKey.get(HEART_CAP_KEY)?.displayName ?? HEART_CAP_KEY}
        description={descriptionOf(HEART_CAP_KEY)}
        value={setting.heartCap}
        min={STARTING_HEARTS}
        max={MAX_HEART_CAP}
        disabled={readOnly}
        formatValue={heartLabel}
        readout={readOnly}
        onChange={(heartCap) => onChange?.({ ...setting, heartCap })}
      />
    </RandomizerOptionGroup>
  );
};

export { DifficultyBlock };
