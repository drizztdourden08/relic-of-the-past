/* @layer sanctuary-site @kind component */
/**
 * The column on the right of a page's card: its panels stacked top to bottom, each a card
 * with the page's own panel treatment (a child carries the `side-panel` class for it).
 * The host renders the column only while at least one panel is open.
 */
import type { ReactNode } from 'react';
import { Flex } from '@ds/primitives/Flex';
import './SideColumn.css';

type SideColumnProps = { children: ReactNode };

const SideColumn = (props: SideColumnProps) => {
  const { children } = props;
  return (
    <Flex as="aside" direction="column" align="stretch" className="side-column">
      {children}
    </Flex>
  );
};

export { SideColumn };
export type { SideColumnProps };
