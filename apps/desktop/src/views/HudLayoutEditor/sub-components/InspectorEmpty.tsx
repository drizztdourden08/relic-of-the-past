/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';

const InspectorEmpty = () => (
  <Box className="hud-inspect">
    <Text className="hud-editor__hint">
      Select a node in the outline or on the stage.
    </Text>
  </Box>
);

export { InspectorEmpty };
