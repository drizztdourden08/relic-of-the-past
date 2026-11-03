/* @layer renderer-components @kind component */
import { Box, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { OptionGroup, OptionRow, ValueTag } from '@drizztdourden08/tessera/composites';
import { COPY_MULTIPLIER_LABELS, MAX_HEART_CAP, STARTING_HEARTS, asCopyMultiplier, HEART_CAP_KEY, difficultyCopiesKeyOf, PROGRESSIVE_FAMILIES, progressiveFamilyName, tickedCountOf, optionByKey } from '@rotp/randomizer';
import { OptionDescription } from '../OptionDescription';
import {
  DIFFICULTY_COPIES_HEADING, DIFFICULTY_HEARTS_HEADING, DIFFICULTY_TITLE, FIRST_STEP, LAST_STEP,
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
    <OptionGroup title={DIFFICULTY_TITLE} tone="live" className="difficulty-block">
      <Text className="difficulty-block__heading">{DIFFICULTY_COPIES_HEADING}</Text>
      <Box className="difficulty-block__copies">
        {PROGRESSIVE_FAMILIES.map((family) => {
          const rungs = tickedCountOf(tiers, family.id);
          return (
            <OptionRow
              key={family.id}
              label={progressiveFamilyName(family)}
              description={<OptionDescription description={rungs === 0
                ? NO_RUNGS_NOTE
                : descriptionOf(difficultyCopiesKeyOf(family.id))} />}
              control={readOnly ? <ValueTag value={multipleLabel(setting.copies[family.id])} /> : (
                <Slider
                  value={setting.copies[family.id]}
                  min={FIRST_STEP}
                  max={LAST_STEP}
                  disabled={rungs === 0}
                  showValue
                  formatValue={multipleLabel}
                  onChange={(value) => onChange({
                    ...setting,
                    copies: { ...setting.copies, [family.id]: asCopyMultiplier(value) },
                  })}
                />
              )}
            />
          );
        })}
      </Box>
      <Text className="difficulty-block__heading">{DIFFICULTY_HEARTS_HEADING}</Text>
      <OptionRow
        label={optionByKey.get(HEART_CAP_KEY)?.displayName ?? HEART_CAP_KEY}
        description={<OptionDescription description={descriptionOf(HEART_CAP_KEY)} />}
        control={readOnly ? <ValueTag value={heartLabel(setting.heartCap)} /> : (
          <Slider
            value={setting.heartCap}
            min={STARTING_HEARTS}
            max={MAX_HEART_CAP}
            showValue
            formatValue={heartLabel}
            onChange={(heartCap) => onChange({ ...setting, heartCap })}
          />
        )}
      />
    </OptionGroup>
  );
};

export { DifficultyBlock };
