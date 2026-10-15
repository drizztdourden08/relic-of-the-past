/* @layer renderer-components @kind component */
import { Box, Slider, Toggle } from '@drizztdourden08/tessera/primitives';
import { CAPACITY_BONUS_MAX, CAPACITY_BONUS_STEP } from '@rotp/randomizer';
import { OptionValueTag } from '../../OptionValueTag';
import { STEP_BASE_LABEL } from '../CapacityFamilyRow.constants';
import type { BonusLineProps } from '../CapacityFamilyRow.type';
import { RowLine } from './RowLine';

const percentLabel = (percent: number): string => `${percent}%`;

const BonusLine = (props: BonusLineProps) => {
  const { bonus, caption, readOnly, readout = false, onChange } = props;

  if (readout) {
    return (
      <RowLine label="bonus" note={caption}>
        <OptionValueTag value={percentLabel(bonus.percent)} />
        <OptionValueTag label={STEP_BASE_LABEL} value={bonus.stepBase} />
      </RowLine>
    );
  }

  return (
    <RowLine label="bonus" note={caption}>
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
        label={STEP_BASE_LABEL}
        checked={bonus.stepBase}
        disabled={readOnly}
        onChange={(stepBase) => onChange?.({ ...bonus, stepBase })}
      />
    </RowLine>
  );
};

export { BonusLine };
