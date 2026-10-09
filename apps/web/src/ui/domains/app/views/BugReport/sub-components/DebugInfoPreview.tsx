/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { DebugInfoPreviewProps } from '../BugReportDialog.type';

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
