/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import type { StudioPanelProps } from '../StudioFrame.type';

const StudioPanel = (props: StudioPanelProps) => {
  const { side, spec } = props;
  const { title, content, defaultCollapsed = false } = spec;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pointsOut = (side === 'left') === collapsed;
  const classes = ['studio-frame__panel', `studio-frame__panel--${side}`, collapsed && 'studio-frame__panel--collapsed'];

  return (
    <Box as="aside" aria-label={title} className={classes.filter(Boolean).join(' ')}>
      <Box className="studio-frame__panel-head">
        <Text as="h2" variant="overline" className="studio-frame__panel-title">{title}</Text>
        <IconButton
          variant="ghost"
          size="xs"
          label={collapsed ? `Show ${title}` : `Hide ${title}`}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        >
          <Icon name={pointsOut ? 'chevron-right' : 'chevron-left'} />
        </IconButton>
      </Box>
      {!collapsed && <Box className="studio-frame__panel-body">{content}</Box>}
    </Box>
  );
};

export { StudioPanel };
