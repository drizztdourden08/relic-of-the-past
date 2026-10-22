/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { RUMBLE_TESTS } from './ControllerCard.constants';
import { RumbleStrengthControl } from './RumbleStrengthControl';
import { RumbleTestButton } from './RumbleTestButton';
import type { ControllerCardActionsProps } from './ControllerCardHeader.type';

const ControllerCardActions = ({ deviceKey, state }: ControllerCardActionsProps) => (
  <Box className="input-cal__card-actions">
    {RUMBLE_TESTS.map((test) => <RumbleTestButton key={test.label} deviceKey={deviceKey} test={test} />)}
    <RumbleStrengthControl deviceKey={deviceKey} />
    <Text className="input-cal__debug-state">
      t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '-'}
      {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
      {' '}axes={state.axes.map(a => a.toFixed(1)).join(',')}
    </Text>
  </Box>
);

export { ControllerCardActions };
