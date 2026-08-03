/* @layer renderer-app @kind component */
/**
 * The detail side, foldable — shared by a plain collection's single record and
 * a recommendation's two-pane comparison alike, so folding the detail pane
 * away works the same way everywhere in the Data Inspector.
 *
 * Same mechanism as the Controls page's Profiles column (ControlsSidebar +
 * ControlsSettings.css): a bare 22px toggle in a header beside a title, and a
 * collapsed state that hides the content, shrinks the column to fit and turns
 * the title on its side so the folded strip still says what is behind it. The
 * glyphs point the way the panel opens, which for a right-hand column is the
 * mirror of the left-hand one's — `◀` to unfold leftwards, `▶` to fold away.
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
