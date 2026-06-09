/* @layer renderer-widgets @kind data */
import type { CSSProperties } from 'react';

/** Shared inline-style map for the Navigation widget + its sub-components. */
const S: Record<string, CSSProperties> = {
  root: {
    background: 'var(--c-glass)',
    color: 'var(--c-text-dim)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    lineHeight: '16px',
    padding: '6px 8px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 3 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: 1, paddingTop: 4 },
  locName: { fontSize: 13, fontWeight: 700, color: 'var(--c-text)' },
  meta: { fontSize: 10, color: 'var(--c-text-muted)' },
  actions: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  btn: {
    padding: '3px 8px', background: 'var(--c-green-soft)', border: '1px solid var(--c-green-soft)',
    borderRadius: 'var(--r-sm)', color: 'var(--c-green-bright)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  btnActive: { background: 'var(--c-info-soft)', borderColor: 'var(--c-info-soft)', color: 'var(--c-info)' },
  infoBox: { display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 6px', borderRadius: 'var(--r-sm)', background: 'var(--c-hover)', border: '1px solid var(--c-border)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--c-text-dim)' },
  infoLabel: { color: 'var(--c-text-muted)' },
  connCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 6px', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', marginTop: 2 },
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 88, padding: '6px 4px', borderRadius: 5, background: 'var(--c-hover)', border: '1px solid var(--c-border)' },
  cardGraphic: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 48, flexShrink: 0 },
  cardTitle: { fontSize: 9, fontWeight: 600, color: 'var(--c-text-dim)', textAlign: 'center', lineHeight: '11px', marginTop: 4, wordBreak: 'break-word' } as CSSProperties,
  cardSub: { fontSize: 8, color: 'var(--c-text-muted)', marginTop: 2 },
  diamond: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  diamondRow: { display: 'flex', justifyContent: 'center' },
  diamondMid: { display: 'flex', gap: 4, justifyContent: 'center' },
  connHeader: { display: 'flex', alignItems: 'center', gap: 5 },
  connTitle: { fontSize: 11, fontWeight: 600, color: 'var(--c-text-dim)' },
  dimBadge: { fontSize: 9, padding: '0 4px', borderRadius: 'var(--r-sm)', background: 'var(--c-border)', color: 'var(--c-text-muted)', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" },
};

export { S };
