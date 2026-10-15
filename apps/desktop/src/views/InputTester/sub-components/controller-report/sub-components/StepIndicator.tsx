/* @layer renderer-components @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { stepState } from '../behavior/step-state';
import type { StepIndicatorProps } from '../controller-report.type';
import './StepIndicator.css';

const StepIndicator = (props: StepIndicatorProps) => {
  const { labels, current } = props;

  return (
    <Box className="controller-report__steps">
      {labels.map((label, i) => {
        const state = stepState(i, current);
        return (
          <Box key={label} className={`controller-report__step controller-report__step--${state}`}>
            <Text className="controller-report__step-num">{i < current ? <Icon name="check" /> : i + 1}</Text>
            <Text className="controller-report__step-label">{label}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export { StepIndicator };
