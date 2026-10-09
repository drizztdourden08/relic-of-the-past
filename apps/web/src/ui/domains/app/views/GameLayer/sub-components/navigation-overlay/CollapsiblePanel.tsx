/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { CollapsiblePanelProps } from './CollapsiblePanel.type';

const S: Record<string, CSSProperties> = {
  panel: {
    background: 'var(--c-glass)', border: '1px solid var(--c-hairline)',
    borderRadius: 'var(--r-sm)', padding: '3px 6px',
    boxShadow: 'var(--shadow-1)',
    fontFamily: 'monospace', fontSize: 10, lineHeight: '14px',
    display: 'flex', flexDirection: 'column', gap: 1,
    pointerEvents: 'auto',
  },
  head: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 8, cursor: 'pointer', userSelect: 'none',
  },
  title: {
    color: 'var(--c-gold-bright)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 9,
  },
  chevron: {
    color: 'var(--c-gold-bright)', fontSize: 16, lineHeight: '16px',
    fontWeight: 700, padding: '0 2px',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 },
};

const CollapsiblePanel = ({ title, defaultOpen = true, children }: CollapsiblePanelProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  return (
    <Box style={S.panel}>
      <Box
        style={S.head}
        onClick={toggle}
        title={open ? 'collapse' : 'expand'}
      >
        <Text style={S.title}>{title}</Text>
        <Text style={S.chevron}>{open ? '▾' : '▸'}</Text>
      </Box>
      {open && <Box style={S.body}>{children}</Box>}
    </Box>
  );
};

export { CollapsiblePanel };
