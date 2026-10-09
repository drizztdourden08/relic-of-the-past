/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  cellName: { fontWeight: 700, fontSize: 11, position: 'relative' },
  cellHex: { color: 'var(--c-text-muted)', fontSize: 9, position: 'relative' },
  cellCount: { fontSize: 9, color: 'var(--c-text-dim)', position: 'relative' },
};

export { IL };
