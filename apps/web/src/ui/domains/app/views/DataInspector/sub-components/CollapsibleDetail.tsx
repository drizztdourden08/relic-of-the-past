/* @layer renderer-app @kind component */
/**
 * The foldable detail side, shared by a single record and the two-pane
 * comparison. Same mechanism as the Controls page's Profiles column
 * (ControlsSidebar + ControlsSettings.css). The glyphs point the way the panel
 * opens; for a right-hand column that is the mirror of the left-hand one.
 */
import { Box, Button, Text } from '@ds/primitives';
import './CollapsibleDetail.css';
import type { ReactNode } from 'react';

const EXPAND = 'Expand';
const COLLAPSE = 'Collapse';

interface CollapsibleDetailProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const CollapsibleDetail = (props: CollapsibleDetailProps) => {
  const { title, collapsed, onToggle, children } = props;

  return (
    <Box className={`collapsible-detail${collapsed ? ' collapsible-detail--collapsed' : ''}`}>
      <Box className="collapsible-detail__header">
        <Button
          variant="bare"
          className="collapsible-detail__toggle"
          onClick={onToggle}
          title={collapsed ? EXPAND : COLLAPSE}
        >
          {collapsed ? '◀' : '▶'}
        </Button>
        <Text className="collapsible-detail__title">{title}</Text>
      </Box>
      <Box className="collapsible-detail__content">{children}</Box>
    </Box>
  );
};

export { CollapsibleDetail };
export type { CollapsibleDetailProps };
