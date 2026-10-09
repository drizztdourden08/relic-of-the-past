/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';

const CALIBRATION_STYLE: Record<string, CSSProperties> = {
  row8: { display: 'flex', gap: 8 },
  para: { fontSize: 13, color: 'var(--c-text-dim)', margin: '0 0 12px' },
  actions12: { display: 'flex', gap: 8, marginTop: 12 },
  actions16: { display: 'flex', gap: 8, marginTop: 16 },
  hint: { fontSize: 11, color: 'var(--c-text-muted)', alignSelf: 'center' },
};

const PERCENT = 100;

export { CALIBRATION_STYLE, PERCENT };
