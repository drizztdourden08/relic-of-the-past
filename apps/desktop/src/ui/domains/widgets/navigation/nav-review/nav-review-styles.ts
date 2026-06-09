/* @layer renderer-widgets @kind logic */
/** Direction labels/colors, status buttons, requirement options, and styles for NavReviewPanel. */
import type React from 'react';
import type { ReviewStatus } from './nav-review.type';

const DIR_LABELS: Record<string, string> = { n: '⬆ North', s: '⬇ South', e: '➡ East', w: '⬅ West' };
const DIR_COLORS: Record<string, string> = { n: '#4488ff', s: '#44ff88', e: '#ff8844', w: '#bb44ff' };

const STATUS_BTNS: { key: ReviewStatus; label: string; color: string }[] = [
  { key: 'neutral', label: '—', color: '#666' },
  { key: 'good', label: '✓', color: '#4c4' },
  { key: 'bad', label: '✗', color: '#f44' },
  { key: 'yellow', label: '⚠', color: '#fc4' },
];

const REQUIREMENT_OPTIONS = [
  'lift.1', 'lift.2', 'lift.3', 'hammer', 'boots', 'flippers', 'hookshot',
  'bombs', 'sword', 'boomerang', 'mirror', 'moonpearl', 'firerod', 'lamp',
];

const S: Record<string, React.CSSProperties> = {
  panel: { display: 'flex', flexDirection: 'column', gap: 4 },
  header: { display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 },
  headerTitle: { fontSize: 10, fontWeight: 700, color: 'var(--c-info)', textTransform: 'uppercase', letterSpacing: 1 },
  badge: { fontSize: 9, padding: '1px 5px', borderRadius: 'var(--r-lg)', background: 'var(--c-info-soft)', color: 'var(--c-info)' },
  summary: { fontSize: 9, color: 'var(--c-text-muted)' },
  screenReview: { marginBottom: 2 },
  dirSection: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 },
  dirHeader: { display: 'flex', alignItems: 'center', gap: 5 },
  dirDot: { width: 6, height: 6, borderRadius: 'var(--r-sm)', flexShrink: 0 },
  dirLabel: { fontSize: 10, fontWeight: 600, color: 'var(--c-text-dim)' },
  dirMeta: { fontSize: 9, color: 'var(--c-text-muted)', marginLeft: 'auto' },
  pointCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '3px 6px', marginLeft: 8, borderLeft: '2px solid', borderRadius: 'var(--r-sm)', background: 'var(--c-hover)' },
  pointHeader: { display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  expandIcon: { fontSize: 8, color: 'var(--c-text-muted)', width: 10 },
  pointTitle: { fontSize: 9, fontWeight: 500, color: '#bbb', fontFamily: "'JetBrains Mono', monospace" },
  tileBadge: { fontSize: 8, padding: '0 4px', borderRadius: 'var(--r-sm)', background: 'var(--c-border)', color: 'var(--c-text-muted)', marginLeft: 'auto' },
  statusIcon: { fontSize: 10, fontWeight: 700 },
  pointBody: { display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 14, paddingTop: 2 },
  fieldRow: { display: 'flex', gap: 6, alignItems: 'baseline' },
  fieldLabel: { fontSize: 9, color: 'var(--c-text-muted)', minWidth: 70 },
  fieldValue: { fontSize: 9, color: 'var(--c-text-dim)', fontFamily: "'JetBrains Mono', monospace" },
  correctedBadge: { fontSize: 8, marginLeft: 4, padding: '0 3px', borderRadius: 'var(--r-sm)', background: 'var(--c-warning-soft)', color: 'var(--c-warning)' },
  reviewRow: { marginTop: 3 },
  statusRow: { display: 'flex', gap: 3 },
  statusBtn: { padding: '1px 6px', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', fontSize: 9, cursor: 'pointer', background: 'var(--c-hover)', color: 'var(--c-text-muted)', fontFamily: 'inherit' },
  commentInput: { width: '100%', padding: '2px 6px', background: 'var(--c-hover)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', color: 'var(--c-text-dim)', fontSize: 9, fontFamily: 'inherit', outline: 'none', marginTop: 3 },
  editBtn: { fontSize: 9, padding: '2px 6px', background: 'var(--c-border)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', color: 'var(--c-text-dim)', cursor: 'pointer', fontFamily: 'inherit' },
  reqEditor: { display: 'flex', flexDirection: 'column', gap: 4, padding: 4, border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', marginTop: 2 },
  reqGrid: { display: 'flex', flexWrap: 'wrap', gap: 3 },
  reqChip: { fontSize: 8, padding: '1px 5px', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', background: 'var(--c-hover)', color: 'var(--c-text-muted)', cursor: 'pointer', fontFamily: 'inherit' },
  reqChipActive: { background: 'var(--c-green-soft)', borderColor: 'var(--c-green-soft)', color: 'var(--c-green-bright)' },
  reqActions: { display: 'flex', gap: 4 },
  selectInput: { fontSize: 9, padding: '1px 4px', background: 'var(--c-border)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', color: 'var(--c-text-dim)', fontFamily: 'inherit' },
};

export { DIR_LABELS, DIR_COLORS, STATUS_BTNS, REQUIREMENT_OPTIONS, S };
