/* @layer renderer-app @kind component */
import { Box, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { COLLAPSE_LABEL, EXPAND_LABEL } from '../DataInspector.constants';
import type { CollapsibleDetailProps } from '../DataInspector.type';
import './CollapsibleDetail.css';

const CollapsibleDetail = (props: CollapsibleDetailProps) => {
  const { title, collapsed, onToggle, children } = props;

  return (
    <Box className={`collapsible-detail${collapsed ? ' collapsible-detail--collapsed' : ''}`}>
      <Box className="collapsible-detail__header">
        <IconButton variant="ghost" size="xs" label={collapsed ? EXPAND_LABEL : COLLAPSE_LABEL} onClick={onToggle}>
          <Icon name={collapsed ? 'chevron-left' : 'chevron-right'} />
        </IconButton>
        <Text className="collapsible-detail__title">{title}</Text>
      </Box>
      <Box className="collapsible-detail__content">{children}</Box>
    </Box>
  );
};

export { CollapsibleDetail };
