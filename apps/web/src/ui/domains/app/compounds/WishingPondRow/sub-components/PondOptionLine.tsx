/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import type { PondOptionLineProps } from '../WishingPondRow.type';

const PondOptionLine = (props: PondOptionLineProps) => {
  const { label, children } = props;

  return (
    <Box className="pond-row__line">
      <Text className="pond-row__caption">{label}</Text>
      {children}
    </Box>
  );
};

export { PondOptionLine };
export type { PondOptionLineProps };
