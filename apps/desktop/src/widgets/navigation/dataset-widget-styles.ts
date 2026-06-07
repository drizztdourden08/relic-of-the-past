/* @layer renderer-widgets @kind logic */
/** Presentational styles + status-button config for the Dataset & Mapping widget. */
import type React from 'react';
import type { ReviewStatus } from './dataset-widget-types';

const STATUS_BTNS: { key: ReviewStatus; label: string; color: string }[] = [
  { key: 'neutral', label: '—', color: '#666' },
  { key: 'good', label: '✓', color: '#4c4' },
  { key: 'bad', label: '✗', color: '#f44' },
  { key: 'yellow', label: '⚠', color: '#fc4' },
];

const S: Record<string, React.CSSProperties> = {
  root: {
    padding: 8, display: 'flex', flexDirection: 'column', gap: 8,
    fontSize: 11, color: '#ddd', overflow: 'auto', height: '100%',
  },
  section: { padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 },
  infoBox: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 6, minHeight: 18 },
  infoLabel: { width: 80, fontSize: 10, color: '#888', flexShrink: 0 },
  btn: {
    padding: '3px 8px', fontSize: 10, background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: '#ccc',
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
  },
  statusRow: { display: 'flex', gap: 4, marginTop: 4 },
  statusBtn: {
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4, cursor: 'pointer', color: '#666',
  },
  commentInput: {
    width: '100%', padding: '2px 6px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, color: '#ccc',
    fontSize: 10, fontFamily: 'inherit', outline: 'none', marginTop: 3,
  },
};

export { STATUS_BTNS, S };
