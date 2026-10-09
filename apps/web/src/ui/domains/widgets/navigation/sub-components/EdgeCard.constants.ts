/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  blocked: { opacity: 0.55, borderColor: 'var(--c-warning)' },
  blockedTag: { fontSize: 9, color: 'var(--c-warning)' },
  layerRow: { fontSize: 9, marginTop: 2 },
  layerTarget: { color: 'var(--c-info)' },
};

export { IL };
