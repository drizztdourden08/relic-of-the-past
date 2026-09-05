/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';

interface DebugInfoPreviewProps {
  text: string | null;
}

/** Debug info is always attached; this only lets the player see what is being sent. */
const DebugInfoPreview = (props: DebugInfoPreviewProps) => {
  const { text } = props;

  return (
    <Box as="details" className="bug-report__debug-info">
      <Box as="summary">Debug info (attached automatically)</Box>
      <Text as="pre" className="bug-report__debug-info-text">{text ?? 'Collecting...'}</Text>
    </Box>
  );
};

export { DebugInfoPreview };
export type { DebugInfoPreviewProps };
