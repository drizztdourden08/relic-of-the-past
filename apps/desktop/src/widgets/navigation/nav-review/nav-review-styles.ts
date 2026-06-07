/* @layer renderer-widgets @kind logic */
/** Direction labels/colors, status buttons, requirement options, and styles for NavReviewPanel. */
import type React from 'react';
import type { ReviewStatus } from './types';

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
  headerTitle: { fontSize: 10, fontWeight: 700, color: '#aaf', textTransform: 'uppercase', letterSpacing: 1 },
  badge: { fontSize: 9, padding: '1px 5px', borderRadius: 8, background: 'rgba(100,100,255,0.15)', color: '#aaf' },
  summary: { fontSize: 9, color: '#777' },
  screenReview: { marginBottom: 2 },
  dirSection: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 },
  dirHeader: { display: 'flex', alignItems: 'center', gap: 5 },
  dirDot: { width: 6, height: 6, borderRadius: 2, flexShrink: 0 },
  dirLabel: { fontSize: 10, fontWeight: 600, color: '#ccc' },
  dirMeta: { fontSize: 9, color: '#666', marginLeft: 'auto' },
  pointCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '3px 6px', marginLeft: 8, borderLeft: '2px solid', borderRadius: 2, background: 'rgba(255,255,255,0.02)' },
  pointHeader: { display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  expandIcon: { fontSize: 8, color: '#888', width: 10 },
  pointTitle: { fontSize: 9, fontWeight: 500, color: '#bbb', fontFamily: "'JetBrains Mono', monospace" },
  tileBadge: { fontSize: 8, padding: '0 4px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: '#888', marginLeft: 'auto' },
  statusIcon: { fontSize: 10, fontWeight: 700 },
  pointBody: { display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 14, paddingTop: 2 },
  fieldRow: { display: 'flex', gap: 6, alignItems: 'baseline' },
  fieldLabel: { fontSize: 9, color: '#666', minWidth: 70 },
  fieldValue: { fontSize: 9, color: '#aaa', fontFamily: "'JetBrains Mono', monospace" },
  correctedBadge: { fontSize: 8, marginLeft: 4, padding: '0 3px', borderRadius: 3, background: 'rgba(255,200,0,0.15)', color: '#fc4' },
  reviewRow: { marginTop: 3 },
  statusRow: { display: 'flex', gap: 3 },
  statusBtn: { padding: '1px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, fontSize: 9, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: '#888', fontFamily: 'inherit' },
  commentInput: { width: '100%', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, color: '#ccc', fontSize: 9, fontFamily: 'inherit', outline: 'none', marginTop: 3 },
  editBtn: { fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, color: '#aaa', cursor: 'pointer', fontFamily: 'inherit' },
  reqEditor: { display: 'flex', flexDirection: 'column', gap: 4, padding: 4, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 2 },
  reqGrid: { display: 'flex', flexWrap: 'wrap', gap: 3 },
  reqChip: { fontSize: 8, padding: '1px 5px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#888', cursor: 'pointer', fontFamily: 'inherit' },
  reqChipActive: { background: 'rgba(100,200,100,0.15)', borderColor: 'rgba(100,200,100,0.4)', color: '#8f8' },
  reqActions: { display: 'flex', gap: 4 },
  selectInput: { fontSize: 9, padding: '1px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, color: '#ccc', fontFamily: 'inherit' },
};

export { DIR_LABELS, DIR_COLORS, STATUS_BTNS, REQUIREMENT_OPTIONS, S };
