/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  emoji: { fontSize: 12, marginRight: 2 },
  chip: { fontSize: 10, color: 'var(--c-warning)', marginRight: 4, background: 'var(--c-warning-soft)', padding: '0 3px', borderRadius: 'var(--radius-sm)' },
};

export { IL };
