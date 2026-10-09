/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', height: '100%' },
  mbMd: { marginBottom: 'var(--space-md)' },
  actionRow: { display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' },
  scroll: { flex: 1, overflow: 'auto', marginTop: 'var(--space-xs)' },
};

export { IL };
