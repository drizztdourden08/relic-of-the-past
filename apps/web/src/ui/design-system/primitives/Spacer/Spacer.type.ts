/* @layer renderer-components @kind types */
import type { SpaceToken } from '../Flex';

interface SpacerProps {
  /** Fixed size (a spacing token). Omit for a flexible filler that pushes siblings apart. */
  size?: SpaceToken;
}

export type { SpacerProps };
