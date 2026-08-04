/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';

/** Static style map — only dynamic/positioned styles stay inline. */
const S: Record<string, CSSProperties> = {
  headerRow: { display: 'flex', justifyContent: 'space-between', gap: 12 },
  row: { display: 'flex', gap: 8, alignItems: 'baseline' },
  dualRow: { display: 'flex', gap: 0 },
  dualColLeft: { flex: 1, borderRight: '1px solid var(--c-border)', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 1 },
  dualColRight: { flex: 1, paddingLeft: 6, display: 'flex', flexDirection: 'column', gap: 1 },
  col: { display: 'flex', flexDirection: 'column', gap: 1 },
  colHeadInfo: { color: 'var(--c-info)', fontWeight: 'bold', fontSize: 10 },
  colHeadGold: { color: 'var(--c-gold)', fontWeight: 'bold', fontSize: 10 },
  lockedTag: { color: 'var(--c-danger)', fontSize: 9 },
  hookable: { color: 'var(--c-green)', fontWeight: 'bold' },
  muted: { color: 'var(--c-text-muted)' },
  dim: { color: 'var(--c-text-dim)' },
  info: { color: 'var(--c-info)' },
  warning: { color: 'var(--c-warning)' },
  text: { color: 'var(--c-text)' },
};

export { S };
