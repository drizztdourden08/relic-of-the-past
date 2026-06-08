/* @layer renderer-components @kind component */
import { Flex } from '../Flex';
import type { CenterProps } from './Center.type';

/** Centers its children on both axes — a Flex preset. */
const Center = (props: CenterProps) => {
  return <Flex align="center" justify="center" {...props} />;
};

export { Center };
