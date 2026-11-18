/* @layer renderer-components @kind component */
import { Box, Slider, Toggle } from '@drizztdourden08/tessera/primitives';
import { ValueTag } from '@drizztdourden08/tessera/composites';
import { CAPACITY_BONUS_MAX, CAPACITY_BONUS_STEP } from '@rotp/randomizer';
import { useT } from '@drizztdourden08/brock-react';
import type { BonusLineProps } from '../CapacityFamilyRow.type';
import { RowLine } from './RowLine';

const percentLabel = (percent: number): string => `${percent}%`;

const BonusLine = (props: BonusLineProps) => {
  const { bonus, caption, readOnly, readout = false, onChange } = props;
  const t = useT();
  const stepBaseLabel = t('compounds:capacity.step-base');

  if (readout) {
    return (
      <RowLine label={t('compounds:capacity.row.bonus')} note={caption}>
        <ValueTag value={percentLabel(bonus.percent)} />
        <ValueTag label={stepBaseLabel} value={bonus.stepBase} />
      </RowLine>
    );
  }

  return (
    <RowLine label={t('compounds:capacity.row.bonus')} note={caption}>
      <Box className="capacity-row__grow">
        <Slider
          value={bonus.percent}
          min={0}
          max={CAPACITY_BONUS_MAX}
          step={CAPACITY_BONUS_STEP}
          disabled={readOnly}
          formatValue={percentLabel}
          onChange={(percent) => onChange?.({ ...bonus, percent })}
        />
      </Box>
      <Toggle
        label={stepBaseLabel}
        checked={bonus.stepBase}
        disabled={readOnly}
        onChange={(stepBase) => onChange?.({ ...bonus, stepBase })}
      />
    </RowLine>
  );
};

export { BonusLine };
