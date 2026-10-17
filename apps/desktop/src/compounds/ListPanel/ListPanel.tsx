/* @layer renderer-components @kind component */
import { Box, ScrollArea, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { CollapseToggle } from '@drizztdourden08/tessera/composites';
import type { ListPanelProps } from './ListPanel.type';
import './ListPanel.css';

const ListPanel = (props: ListPanelProps) => {
  const { title, side = 'start', action, rail, collapsed, onToggle, children, className } = props;
  const classes = ['list-panel', `list-panel--${side}`, collapsed && 'list-panel--collapsed', className].filter(Boolean).join(' ');

  return (
    <Box as="aside" surface="sunken" aria-label={title} className={classes}>
      <CollapseToggle collapsed={collapsed} onToggle={onToggle} label={title} side={side} className="list-panel__toggle" />
      {collapsed ? (
        <Box className="list-panel__rail">
          {action}
          {rail}
        </Box>
      ) : (
        <>
          <Box className="list-panel__head">
            <Text variant="overline">{title}</Text>
            {action}
          </Box>
          <ScrollArea className="list-panel__body">
            <Stack gap="xs">{children}</Stack>
          </ScrollArea>
        </>
      )}
    </Box>
  );
};

export { ListPanel };
