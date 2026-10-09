/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  row: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  chip: {
    fontSize: 10,
    padding: '1px 6px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--c-hover)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text-dim)',
  },
  chipGating: {
    background: 'var(--c-green-soft)',
    border: '1px solid var(--c-green)',
    color: 'var(--c-green-bright)',
  },
  detail: { color: 'var(--c-text-muted)' },
  none: { fontSize: 10, color: 'var(--c-text-muted)', marginTop: 2 },
};

export { IL };
