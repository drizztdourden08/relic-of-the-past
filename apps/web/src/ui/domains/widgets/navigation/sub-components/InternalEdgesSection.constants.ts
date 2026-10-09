/* @layer renderer-widgets @kind constants */
import type { CSSProperties } from 'react';

const IL: Record<string, CSSProperties> = {
  wrapRow: { display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  same: { fontSize: 8, color: 'var(--c-green)', marginTop: 2 },
};

export { IL };
