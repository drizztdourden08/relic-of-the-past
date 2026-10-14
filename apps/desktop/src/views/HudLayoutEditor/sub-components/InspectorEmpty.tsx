/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';

const InspectorEmpty = () => (
  <Box className="hud-inspect">
    <Text className="hud-editor__label">Inspector</Text>
    <Text className="hud-editor__hint">
      Select a node in the outline or on the stage. An insert lands in the selected
      container, or beside the selected element.
    </Text>
  </Box>
);

export { InspectorEmpty };
