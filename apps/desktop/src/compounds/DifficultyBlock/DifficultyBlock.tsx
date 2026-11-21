/* @layer renderer-components @kind component */
import { Box, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { useT, useText } from '@drizztdourden08/brock-react';
import { OptionGroup, OptionRow, ValueTag } from '@drizztdourden08/tessera/composites';
import { COPY_MULTIPLIER_LABELS, MAX_HEART_CAP, STARTING_HEARTS, asCopyMultiplier, HEART_CAP_KEY, difficultyCopiesKeyOf, PROGRESSIVE_FAMILIES, progressiveFamilyName, tickedCountOf, optionByKey } from '@rotp/randomizer';
import { OptionDescription } from '../OptionDescription';
import { FIRST_STEP, LAST_STEP } from './DifficultyBlock.constants';
import type { DifficultyBlockProps } from './DifficultyBlock.type';
import './DifficultyBlock.css';

const descriptionOf = (key: string) => optionByKey.get(key)?.description ?? '';
const multipleLabel = (value: number): string => COPY_MULTIPLIER_LABELS[asCopyMultiplier(value)];
const DifficultyBlock = (props: DifficultyBlockProps) => {
  const t = useT();
  const text = useText();
  const { setting, tiers, onChange } = props;
  const heartLabel = (count: number): string => t('compounds:difficulty-block.hearts', { count });
  const readOnly = onChange === undefined;

  return (
    <OptionGroup title={t('compounds:difficulty-block.title')} tone="live" className="difficulty-block">
      <Text className="difficulty-block__heading">{t('compounds:difficulty-block.copies-heading')}</Text>
      <Box className="difficulty-block__copies">
        {PROGRESSIVE_FAMILIES.map((family) => {
          const rungs = tickedCountOf(tiers, family.id);
          return (
            <OptionRow
              key={family.id}
              label={progressiveFamilyName(family)}
              description={<OptionDescription description={rungs === 0
                ? t('compounds:difficulty-block.no-rungs')
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
      <Text className="difficulty-block__heading">{t('compounds:difficulty-block.hearts-heading')}</Text>
      <OptionRow
        label={text(optionByKey.get(HEART_CAP_KEY)?.displayName ?? HEART_CAP_KEY)}
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
