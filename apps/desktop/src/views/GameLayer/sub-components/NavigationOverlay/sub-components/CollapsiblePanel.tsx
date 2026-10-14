/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { CollapsiblePanelProps } from './CollapsiblePanel.type';
import './CollapsiblePanel.css';

const CollapsiblePanel = ({ title, defaultOpen = true, children }: CollapsiblePanelProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  return (
    <Box className="nav-panel">
      <Box
        className="nav-panel__head"
        onClick={toggle}
        title={open ? 'collapse' : 'expand'}
      >
        <Text className="nav-panel__title">{title}</Text>
        <Text className="nav-panel__chevron">{open ? '▾' : '▸'}</Text>
      </Box>
      {open && <Box className="nav-panel__body">{children}</Box>}
    </Box>
  );
};

export { CollapsiblePanel };
