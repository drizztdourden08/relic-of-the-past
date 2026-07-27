/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';

interface DebugInfoPreviewProps {
  text: string | null;
}

/** Collapsed by default, shown for transparency — debug info is always attached,
 *  there is no way to opt out, this just lets the player see what's being sent. */
const DebugInfoPreview = (props: DebugInfoPreviewProps) => {
  const { text } = props;

  return (
    <Box as="details" className="bug-report__debug-info">
      <Box as="summary">Debug info (attached automatically)</Box>
      <Text as="pre" className="bug-report__debug-info-text">{text ?? 'Collecting…'}</Text>
    </Box>
  );
};

export { DebugInfoPreview };
export type { DebugInfoPreviewProps };
