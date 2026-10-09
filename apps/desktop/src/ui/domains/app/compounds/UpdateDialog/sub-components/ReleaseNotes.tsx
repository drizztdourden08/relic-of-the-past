/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import './ReleaseNotes.css';

const ReleaseNotes = ({ html }: { html: string }) => (
  <Box className="update-dialog__notes">
    <Text as="h4">Release Notes</Text>
    <Box className="update-dialog__notes-content" dangerouslySetInnerHTML={{ __html: html }} />
  </Box>
);

export { ReleaseNotes };
