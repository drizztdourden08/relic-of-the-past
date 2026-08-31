/* @layer renderer-widgets @kind component */
/**
 * The quarter-step row under a stat control. Presentational — it knows the fractions, nothing about
 * what is being filled.
 */
import { Box, Button } from '@ds/primitives';
import { PERCENT_STEPS } from '../StatsTab.constants';

type PercentStepsProps = {
  onPick: (percent: number) => void;
};

const stepLabel = (percent: number): string => (percent === 100 ? 'Full' : `${percent}%`);

const PercentSteps = ({ onPick }: PercentStepsProps) => (
  <Box className="cheats-stat__steps">
    {PERCENT_STEPS.map(percent => (
      <Button key={percent} variant="secondary" size="sm" onClick={() => onPick(percent)}>
        {stepLabel(percent)}
      </Button>
    ))}
  </Box>
);

export { PercentSteps };
export type { PercentStepsProps };
