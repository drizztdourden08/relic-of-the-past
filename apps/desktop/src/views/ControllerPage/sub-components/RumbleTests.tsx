/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { NO_RUMBLE_REASON, RUMBLE_TESTS } from '../ControllerPage.constants';
import type { RumbleTestsProps } from '../ControllerPage.type';
import { RumbleTestButton } from './RumbleTestButton';
import './RumbleTests.css';

const RumbleTests = ({ deviceKey, hasRumble }: RumbleTestsProps) => (
  <Box className="rumble-tests">
    <Text className="rumble-tests__title">Rumble test</Text>
    <Box className="rumble-tests__buttons">
      {RUMBLE_TESTS.map((test) => (
        <RumbleTestButton key={test.label} deviceKey={deviceKey} test={test} disabled={!hasRumble} />
      ))}
    </Box>
    {!hasRumble && <Text className="rumble-tests__reason">{NO_RUMBLE_REASON}</Text>}
  </Box>
);

export { RumbleTests };
