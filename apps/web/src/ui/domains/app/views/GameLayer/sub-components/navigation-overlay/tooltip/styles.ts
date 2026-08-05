/* @layer renderer-components @kind data */
import type { CSSProperties } from 'react';

/**
 * Static style map shared by the tooltip's container, layer blocks and row
 * list — only dynamic/positioned styles (per-tile colors, the tooltip's x/y)
 * stay inline at their call site.
 */
const S: Record<string, CSSProperties> = {
  container: {
    position: 'absolute',
    background: 'var(--c-glass)',
    border: '1px solid var(--c-border-strong)',
    borderRadius: 'var(--r-sm)',
    padding: '5px 8px',
    boxShadow: 'var(--shadow-2)',
    pointerEvents: 'none',
    whiteSpace: 'normal',
    maxWidth: 760,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', gap: 12 },
  row: { display: 'flex', gap: 8, alignItems: 'baseline' },
  dualRow: { display: 'flex', gap: 0 },
  dualColLeft: { flex: 1, borderRight: '1px solid var(--c-border)', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 1 },
  dualColRight: { flex: 1, paddingLeft: 6, display: 'flex', flexDirection: 'column', gap: 1 },
  col: { display: 'flex', flexDirection: 'column', gap: 1 },
  layerHeadRow: { display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: 'bold', fontSize: 10 },
  lockedTag: { color: 'var(--c-danger)', fontSize: 9 },
  classRow: { display: 'flex', gap: 6, alignItems: 'baseline' },
  classLabel: { color: 'var(--c-text-dim)', minWidth: 62 },
  classTag: { color: 'var(--c-text-faint)', fontSize: 9, marginLeft: 'auto' },
  muted: { color: 'var(--c-text-muted)' },
  dim: { color: 'var(--c-text-dim)' },
  text: { color: 'var(--c-text)' },
  warning: { color: 'var(--c-warning)' },
};

export { S };
