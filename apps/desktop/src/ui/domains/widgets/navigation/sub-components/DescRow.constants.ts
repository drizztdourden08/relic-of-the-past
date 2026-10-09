/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  valueRow: { display: 'flex', alignItems: 'center', gap: 4 },
  body: { fontSize: 9, color: 'var(--c-text-dim)', lineHeight: '12px', padding: '2px 0 4px 0', borderBottom: '1px solid var(--c-hover)' },
};

export { IL };
