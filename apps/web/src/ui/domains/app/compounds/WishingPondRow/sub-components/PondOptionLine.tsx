/* @layer renderer-components @kind component */
/**
 * One setting of the pond block that is not a tick: its name in the label
 * track and its control beside it, on the same line and centred against each
 * other. The same two tracks the demand rows above sit on, so every label in
 * the block starts on one vertical line and every control on another, and no
 * setting spends a line on its own name.
 */
import { Box, Text } from '@ds/primitives';
import type { ReactNode } from 'react';

interface PondOptionLineProps {
  label: string;
  children: ReactNode;
}

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
