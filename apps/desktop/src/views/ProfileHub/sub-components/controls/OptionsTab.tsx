/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { HapticsToggle } from './HapticsToggle';
import { RequiredInputs } from './RequiredInputs';
import type { CtrlProps } from './controls.type';
import './OptionsTab.css';

const OptionsTab = ({ ctrl }: CtrlProps) => (
  <Box className="controls-options">
    <HapticsToggle enabled={ctrl.hapticsEnabled} onChange={ctrl.setHapticsEnabled} />
    <RequiredInputs inputs={ctrl.requiredInputs} />
  </Box>
);

export { OptionsTab };
