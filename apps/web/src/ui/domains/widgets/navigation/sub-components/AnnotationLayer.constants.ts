/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  badge: {
    position: 'absolute', display: 'flex', gap: 3, padding: '0 3px',
    borderRadius: 'var(--radius-sm)', background: 'var(--c-glass)', fontSize: 8,
    lineHeight: '10px', pointerEvents: 'none',
  },
  done: { color: 'var(--c-secondary-bright)' },
  avail: { color: 'var(--c-info)' },
};

export { IL };
