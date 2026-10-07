/* @layer renderer-components @kind component */
/**
 * The pickup-bonus line of a capacity family: the percentage a capacity
 * upgrade hands over beside the ceiling it raises, and the switch saying
 * what that percentage is of. The catalog's own clarifier sits under the
 * two, because "of what" is exactly what a percentage cannot say by itself.
 * A `readout` line shows both as tags: the read-only Options page.
 */
import { Box, Slider, Toggle } from '@ds/primitives';
import { CAPACITY_BONUS_MAX, CAPACITY_BONUS_STEP } from '@shared/randomizer/world/capacity';
import { OptionValueTag } from '../../OptionValueTag';
import { RowLine } from './RowLine';
import type { FamilyBonus } from '@shared/randomizer/world/capacity';

interface BonusLineProps {
  bonus: FamilyBonus;
  caption?: string;
  readOnly: boolean;
  /** Both values as tags in place of their controls. */
  readout?: boolean;
  onChange?: (next: FamilyBonus) => void;
}

const STEP_BASE_LABEL = 'of the gain';

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
export type { BonusLineProps };
