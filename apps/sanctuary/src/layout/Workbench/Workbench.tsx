/* @layer sanctuary-site @kind component */
/**
 * The working area of a list page: the FilterBar row over the table on the left, the
 * detail pane on the right when a row is selected. The table scrolls inside its own
 * column; the page does not grow with it.
 */
import type { ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import './Workbench.css';

type WorkbenchProps = {
  /** The FilterBar and whatever sits on its row (the View picker). */
  toolbar: ReactNode;
  table: ReactNode;
  /** Null folds the column away. */
  detail: ReactNode | null;
};

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
export type { WorkbenchProps };
