/* @layer renderer-components @kind component */
/**
 * Each legend box collapses independently and remembers nothing: a collapse is a momentary "get
 * out of the way". The panel must accept pointer events for the chevron even though its container
 * is `pointerEvents: none`.
 */
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';

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
  // Deliberately large: at 9px this was invisible against the game art behind it,
  // and it is the only interactive control on these panels.
  chevron: {
    color: 'var(--c-gold-bright)', fontSize: 16, lineHeight: '16px',
    fontWeight: 700, padding: '0 2px',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 },
};

interface CollapsiblePanelProps {
  title: string;
  /** Open on first render. Collapsed state is per-panel and not persisted. */
  defaultOpen?: boolean;
  children: ReactNode;
}

const CollapsiblePanel = ({ title, defaultOpen = true, children }: CollapsiblePanelProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box style={S.panel}>
      <Box
        style={S.head}
        onClick={() => setOpen((o) => !o)}
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
