/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  reqRow: { display: 'flex', gap: 2, marginTop: 2 },
  blocked: { opacity: 0.55, borderColor: 'var(--c-warning)' },
  blockedTag: { fontSize: 8, color: 'var(--c-warning)', marginTop: 1 },
  layerTag: { fontSize: 8, color: 'var(--c-info)', marginTop: 1 },
};

export { IL };
