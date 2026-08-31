/* @layer renderer-widgets @kind component */
/**
 * One stat, one control: a slider for the value, a readout in the player's units, quarter-step
 * buttons that write straight through, and an explicit Set for anything in between.
 */
import { Box, Button, RangeInput, Text } from '@ds/primitives';
import { useStatValue } from '../behavior/useStatValue';
import { PercentSteps } from './PercentSteps';
import type { StatSpec } from '../StatsTab.type';

type StatControlProps = {
  spec: StatSpec;
};

const StatControl = ({ spec }: StatControlProps) => {
  const { value, setValue, applyValue, applyPercent } = useStatValue(spec);

  return (
    <Box className="cheats-stat">
      <Box className="cheats-row">
        <Text className="cheats-row__label">{spec.label}</Text>
        <Box className="cheats-row__controls">
          <RangeInput
            className="cheats-slider"
            min={spec.min} max={spec.max} step={spec.step} value={value}
            onChange={e => setValue(Number(e.target.value))}
          />
          <Text className="cheats-stat-val">{spec.format(value)}</Text>
          <Button variant="tertiary" size="sm" onClick={applyValue}>Set</Button>
        </Box>
      </Box>
      <PercentSteps onPick={applyPercent} />
    </Box>
  );
};

export { StatControl };
export type { StatControlProps };
