/* @layer renderer-widgets @kind logic */
/** Presentational styles for the connection-audit section of the Dataset widget. */
import type React from 'react';

const AUDIT_S: Record<string, React.CSSProperties> = {
  sectionTitleBad: {
    fontSize: 10, fontWeight: 700, color: 'var(--c-danger)',
    textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4,
  },
  sectionTitleAdd: {
    fontSize: 10, fontWeight: 700, color: 'var(--c-warning)',
    textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4,
  },
  badItem: {
    padding: '4px 6px', marginBottom: 4, borderRadius: 'var(--r-sm)',
    background: 'var(--c-danger-soft)', border: '1px solid var(--c-danger-soft)',
    display: 'flex', flexDirection: 'column' as const, gap: 3,
  },
  addItem: {
    padding: '4px 6px', marginBottom: 4, borderRadius: 'var(--r-sm)',
    background: 'var(--c-warning-soft)', border: '1px solid var(--c-warning-soft)',
    display: 'flex', flexDirection: 'column' as const, gap: 3,
  },
  reason: { fontSize: 10, color: 'var(--c-text-dim)', lineHeight: '14px' },
  fileTarget: { fontSize: 9, color: 'var(--c-text-muted)', fontFamily: 'monospace' },
  codeArea: {
    width: '100%', padding: '2px 6px', background: 'var(--c-hover)',
    border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)',
    color: 'var(--c-text-dim)', fontSize: 10, fontFamily: 'monospace', outline: 'none',
  },
  applyRow: { display: 'flex', alignItems: 'center', gap: 6 },
  error: { fontSize: 9, color: 'var(--c-danger)' },
};

export { AUDIT_S };
