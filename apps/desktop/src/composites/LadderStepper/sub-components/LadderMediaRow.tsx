/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { LadderMediaRowProps } from '../LadderStepper.type';
import { LadderStepMedia } from './LadderStepMedia';

const LadderMediaRow = (props: LadderMediaRowProps) => (
  <Box as="ul" className="ladder-stepper__row">
    {props.steps.map((step) => (
      <Box as="li" key={step.key} className="ladder-stepper__cell">
        <Box className="ladder-stepper__cell-media">
          <LadderStepMedia step={step} />
        </Box>
      </Box>
    ))}
  </Box>
);

export { LadderMediaRow };
