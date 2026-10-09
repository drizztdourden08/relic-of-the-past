/* @layer site-kit @kind component */
import { Flex } from '@ds/primitives/Flex';
import type { SideColumnProps } from './SideColumn.type';
import './SideColumn.css';

const SideColumn = (props: SideColumnProps) => {
  const { children } = props;
  return (
    <Flex as="aside" direction="column" align="stretch" className="side-column">
      {children}
    </Flex>
  );
};

export { SideColumn };
export type { SideColumnProps } from './SideColumn.type';
