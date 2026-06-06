/* @layer renderer-widgets @kind data */
import type { CSSProperties } from 'react';

/** Shared inline-style map for the Navigation widget + its sub-components. */
const S: Record<string, CSSProperties> = {
  root: {
    background: 'rgba(0,0,0,0.8)',
    color: '#ccc',
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
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, paddingTop: 4 },
  locName: { fontSize: 13, fontWeight: 700, color: '#fff' },
  meta: { fontSize: 10, color: '#888' },
  actions: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  btn: {
    padding: '3px 8px', background: 'rgba(100,200,100,0.12)', border: '1px solid rgba(100,200,100,0.35)',
    borderRadius: 3, color: '#8f8', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  btnActive: { background: 'rgba(100,200,255,0.18)', borderColor: 'rgba(100,200,255,0.5)', color: '#8cf' },
  infoBox: { display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#ccc' },
  infoLabel: { color: '#888' },
  connCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', marginTop: 2 },
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 88, padding: '6px 4px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' },
  cardGraphic: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 48, flexShrink: 0 },
  cardTitle: { fontSize: 9, fontWeight: 600, color: '#ddd', textAlign: 'center', lineHeight: '11px', marginTop: 4, wordBreak: 'break-word' } as CSSProperties,
  cardSub: { fontSize: 8, color: '#666', marginTop: 2 },
  diamond: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  diamondRow: { display: 'flex', justifyContent: 'center' },
  diamondMid: { display: 'flex', gap: 4, justifyContent: 'center' },
  connHeader: { display: 'flex', alignItems: 'center', gap: 5 },
  connTitle: { fontSize: 11, fontWeight: 600, color: '#ddd' },
  dimBadge: { fontSize: 9, padding: '0 4px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: '#888', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" },
};

export { S };
