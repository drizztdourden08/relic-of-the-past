/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';

const InspectorEmpty = () => {
  const t = useT();
  return (
    <Box className="hud-inspect">
      <Text className="hud-editor__hint">
        {t('hud-editor:inspector-empty.text.select-a-node-in-the')}
      </Text>
    </Box>
  );
};

export { InspectorEmpty };
