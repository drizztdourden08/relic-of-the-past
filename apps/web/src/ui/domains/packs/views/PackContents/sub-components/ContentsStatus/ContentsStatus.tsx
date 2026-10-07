/* @layer renderer-components @kind component */
/** What shows while a pack is read, or why it could not be. */
import { Box, Spinner, Text } from '@ds/primitives';

type ContentsStatusProps = {
  /** Null while the pack is still being read. */
  error: string | null;
};

const ContentsStatus = (props: ContentsStatusProps) => {
  const { error } = props;

  if (error !== null) {
    return (
      <Box className="pack-contents__status">
        <Text as="p" role="alert" className="pack-contents__error">{error}</Text>
      </Box>
    );
  }
  return (
    <Box className="pack-contents__status" role="status">
      <Spinner />
      <Text as="span" variant="caption">Reading the pack...</Text>
    </Box>
  );
};

export { ContentsStatus };
export type { ContentsStatusProps };
