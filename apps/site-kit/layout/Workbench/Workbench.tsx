/* @layer site-kit @kind component */
import { Box, Flex } from '@drizztdourden08/tessera/primitives';
import type { WorkbenchProps } from './Workbench.type';
import './Workbench.css';

const Workbench = (props: WorkbenchProps) => {
  const { toolbar, table, detail } = props;
  return (
    <Box className={`workbench${detail ? ' workbench--with-detail' : ''}`}>
      <Flex direction="column" align="stretch" className="workbench__list">
        <Flex align="start" gap="sm" className="workbench__toolbar">{toolbar}</Flex>
        <Box className="workbench__table">{table}</Box>
      </Flex>
      {detail}
    </Box>
  );
};

export { Workbench };
export type { WorkbenchProps } from './Workbench.type';
