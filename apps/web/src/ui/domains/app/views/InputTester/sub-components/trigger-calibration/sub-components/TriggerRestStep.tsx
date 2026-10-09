/* @layer renderer-components @kind component */
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { CALIBRATION_STYLE, SamplingProgress } from '../../calibration-parts';
import { TRIGGER_WIZARD_STYLE } from '../trigger-calibration.constants';
import type { TriggerRestStepProps } from '../trigger-calibration.type';
import { TriggerBar } from '../TriggerBar';

const TriggerRestStep = ({ cal, label, axisIndex }: TriggerRestStepProps) => (
  <Box>
    <Text as="p" style={CALIBRATION_STYLE.para}>
      <Text as="strong">Leave the {label} fully released</Text>. Don't touch it. Recording the idle rest position.
    </Text>

    {!cal.restDone ? (
      <SamplingProgress progress={cal.restProgress} />
    ) : (
      <Box>
        <Box style={TRIGGER_WIZARD_STYLE.valueBox}>
          Rest value: {cal.baseValue.toFixed(3)}
        </Box>
        <Box style={CALIBRATION_STYLE.row8}>
          <Button variant="primary" size="sm" onClick={cal.advanceToMax}>
            Next →
          </Button>
          <Button variant="tertiary" size="sm" onClick={cal.resetRest}>Redo</Button>
        </Box>
      </Box>
    )}

    <Box style={TRIGGER_WIZARD_STYLE.barRow}>
      <TriggerBar value={cal.rawValue} label={`${label} (raw)`} step={cal.step} deadzone={cal.deadzone} />
      <Box style={TRIGGER_WIZARD_STYLE.mono}>
        <Box>axis[{axisIndex}]: {cal.rawValue.toFixed(4)}</Box>
        {cal.rawByte !== null && <Box>byte: {cal.rawByte} (0x{cal.rawByte.toString(16).padStart(2, '0')})</Box>}
      </Box>
    </Box>
  </Box>
);

export { TriggerRestStep };
