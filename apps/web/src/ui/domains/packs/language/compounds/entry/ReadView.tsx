/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import type { ReadViewProps } from './entry.type';
import './ReadView.css';

const ReadView = (props: ReadViewProps) => {
  const { prose, note } = props;

  return (
    <Box className="read-view">
      {prose.trim().length > 0 ? (
        <Text as="p" className="read-view__prose">{prose}</Text>
      ) : (
        <Text as="p" variant="caption" className="read-view__empty">This entry has no words.</Text>
      )}
      {note ? (
        <Text as="p" variant="caption" className="read-view__note">{note}</Text>
      ) : null}
    </Box>
  );
};

export { ReadView };
