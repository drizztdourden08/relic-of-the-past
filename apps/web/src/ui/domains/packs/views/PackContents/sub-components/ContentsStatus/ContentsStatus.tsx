/* @layer renderer-components @kind component */
import { Box, Spinner, Text } from '@drizztdourden08/tessera/primitives';
import type { ContentsStatusProps } from '../../PackContents.type';

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
