/* @layer renderer-app @kind component */
import { Box, Button, Text } from '@ds/primitives';
import { COLLAPSE_LABEL, EXPAND_LABEL } from '../DataInspector.constants';
import type { CollapsibleDetailProps } from '../DataInspector.type';
import './CollapsibleDetail.css';

const CollapsibleDetail = (props: CollapsibleDetailProps) => {
  const { title, collapsed, onToggle, children } = props;

  return (
    <Box className={`collapsible-detail${collapsed ? ' collapsible-detail--collapsed' : ''}`}>
      <Box className="collapsible-detail__header">
        <Button
          variant="bare"
          className="collapsible-detail__toggle"
          onClick={onToggle}
          title={collapsed ? EXPAND_LABEL : COLLAPSE_LABEL}
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
