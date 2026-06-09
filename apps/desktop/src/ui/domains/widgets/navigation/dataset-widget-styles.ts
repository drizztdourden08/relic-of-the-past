/* @layer renderer-widgets @kind logic */
/** Presentational styles + status-button config for the Dataset & Mapping widget. */
import type React from 'react';
import type { ReviewStatus } from './dataset-widget-types';

const STATUS_BTNS: { key: ReviewStatus; label: string; color: string }[] = [
  { key: 'neutral', label: '—', color: 'var(--c-text-muted)' },
  { key: 'good', label: '✓', color: 'var(--c-green)' },
  { key: 'bad', label: '✗', color: 'var(--c-danger)' },
  { key: 'yellow', label: '⚠', color: 'var(--c-warning)' },
];

const S: Record<string, React.CSSProperties> = {
  root: {
    padding: 8, display: 'flex', flexDirection: 'column', gap: 8,
    fontSize: 11, color: 'var(--c-text-dim)', overflow: 'auto', height: '100%',
  },
  section: { padding: '6px 8px', background: 'var(--c-hover)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: 'var(--c-text-dim)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 },
  infoBox: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 6, minHeight: 18 },
  infoLabel: { width: 80, fontSize: 10, color: 'var(--c-text-muted)', flexShrink: 0 },
  btn: {
    padding: '3px 8px', fontSize: 10, background: 'var(--c-border)',
    border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', color: 'var(--c-text-dim)',
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
  },
  statusRow: { display: 'flex', gap: 4, marginTop: 4 },
  statusBtn: {
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, background: 'var(--c-hover)', border: '1px solid var(--c-border)',
    borderRadius: 'var(--r-sm)', cursor: 'pointer', color: 'var(--c-text-muted)',
  },
  commentInput: {
    width: '100%', padding: '2px 6px', background: 'var(--c-hover)',
    border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', color: 'var(--c-text-dim)',
    fontSize: 10, fontFamily: 'inherit', outline: 'none', marginTop: 3,
  },
};

export { STATUS_BTNS, S };
