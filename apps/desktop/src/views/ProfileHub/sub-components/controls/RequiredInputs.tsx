/* @layer renderer-components @kind component */
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import type { RequiredInputsProps } from './controls.type';
import './RequiredInputs.css';

const RequiredInputs = ({ inputs }: RequiredInputsProps) => (
  <Box className="controls-settings__used-inputs">
    <Box className="controls-settings__used-inputs-header">Required Inputs</Box>
    <Box className="controls-settings__used-inputs-list">
      {inputs.map((input, idx) => (
        <Box key={`${input.type}-${idx}`} className="controls-settings__used-input">
          <Box className={`controls-settings__used-input-dot ${input.connected ? 'controls-settings__used-input-dot--active' : 'controls-settings__used-input-dot--disconnected'}`} />
          <Image src={input.iconSrc} alt={input.label} className="controls-settings__used-input-icon" />
          <Text className={input.connected ? '' : 'controls-settings__used-input-label--dim'}>{input.label}</Text>
        </Box>
      ))}
    </Box>
  </Box>
);

export { RequiredInputs };
