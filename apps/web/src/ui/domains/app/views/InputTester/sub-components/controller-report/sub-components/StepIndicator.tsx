/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { StepIndicatorProps } from '../controller-report.type';

const StepIndicator = (props: StepIndicatorProps) => {
  const { labels, current } = props;

  return (
    <Box className="controller-report__steps">
      {labels.map((label, i) => {
        const state = i === current ? 'current' : i < current ? 'done' : 'upcoming';
        return (
          <Box key={label} className={`controller-report__step controller-report__step--${state}`}>
            <Text className="controller-report__step-num">{i < current ? '✓' : i + 1}</Text>
            <Text className="controller-report__step-label">{label}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export { StepIndicator };
export type { StepIndicatorProps };
