/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';

const CALIBRATION_STYLE: Record<string, CSSProperties> = {
  row8: { display: 'flex', gap: 8 },
  para: { fontSize: 13, color: 'var(--c-text-dim)', margin: '0 0 12px' },
  progressTrack: { height: 6, background: 'var(--c-sunken)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  sampling: { fontSize: 11, color: 'var(--c-text-muted)' },
  actions12: { display: 'flex', gap: 8, marginTop: 12 },
  actions16: { display: 'flex', gap: 8, marginTop: 16 },
  hint: { fontSize: 11, color: 'var(--c-text-muted)', alignSelf: 'center' },
  dzLabel: { fontSize: 12 },
  dzRow: { display: 'flex', justifyContent: 'space-between' },
  dzPct: { fontFamily: 'monospace', color: 'var(--c-text-muted)' },
  full: { width: '100%' },
  dzNote: { fontSize: 10, color: 'var(--c-text-muted)' },
};

const PROGRESS_FILL: CSSProperties = {
  height: '100%', background: 'var(--c-primary)', borderRadius: 3, transition: 'width 0.1s',
};

const STEP_BAR: CSSProperties = { display: 'flex', gap: 8, margin: '8px 0 12px', fontSize: 12, fontWeight: 600 };

const STEP_ITEM_ACTIVE: CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, color: 'var(--c-primary-bright)' };
const STEP_ITEM_IDLE: CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, color: 'var(--c-text-muted)' };

const STEP_NUMBER_ACTIVE: CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  background: 'var(--c-primary)', color: 'var(--c-bg)', fontSize: 11,
};
const STEP_NUMBER_IDLE: CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  background: 'var(--c-sunken)', color: 'var(--c-text-muted)', fontSize: 11,
};

const PERCENT = 100;

export {
  CALIBRATION_STYLE, PERCENT, PROGRESS_FILL, STEP_BAR,
  STEP_ITEM_ACTIVE, STEP_ITEM_IDLE, STEP_NUMBER_ACTIVE, STEP_NUMBER_IDLE,
};
