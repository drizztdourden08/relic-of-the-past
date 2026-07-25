/* @layer renderer-widgets @kind data */
import type { CSSProperties } from 'react';

/** Inline-style map for the "On this screen" panel. */
const PS: Record<string, CSSProperties> = {
  summary: { display: 'flex', gap: 8, fontSize: 11, marginTop: 2 },
  doneCount: { color: 'var(--c-green-bright)' },
  availCount: { color: 'var(--c-info)' },
  blockedCount: { color: 'var(--c-danger)' },

  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: {
    fontSize: 10,
    padding: '1px 5px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--c-hover)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text-muted)',
  },

  group: { display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4 },
  groupTitle: { fontSize: 10, color: 'var(--c-text-muted)', letterSpacing: 0.5 },

  row: { display: 'flex', alignItems: 'baseline', gap: 5, fontSize: 11 },
  /** Clicking a row toggles its kind on the overlay — the legend is display-only. */
  rowToggle: { cursor: 'pointer' },
  rowOff: { opacity: 0.4 },
  glyph: { width: 12, textAlign: 'center', flexShrink: 0 },
  warnGlyph: { width: 12, textAlign: 'center', flexShrink: 0, color: 'var(--c-warning)' },
  infoGlyph: { width: 12, textAlign: 'center', flexShrink: 0, color: 'var(--c-text-muted)' },
  label: { color: 'var(--c-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  labelSettled: { color: 'var(--c-text-muted)', textDecoration: 'line-through' },
  detail: { color: 'var(--c-text-muted)', fontSize: 10, marginLeft: 'auto', flexShrink: 0 },
  state: { fontSize: 10, color: 'var(--c-warning)', flexShrink: 0 },
  stateSettled: { fontSize: 10, color: 'var(--c-text-muted)', flexShrink: 0 },
  stateBlocked: { fontSize: 10, color: 'var(--c-danger)', flexShrink: 0 },
};

export { PS };
