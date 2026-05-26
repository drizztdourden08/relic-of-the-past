/**
 * NavReviewPanel — per-screen connection point review with comments.
 *
 * Shows:
 *  - Border bundles (contiguous walkable corridors per edge)
 *  - Requirements for each bundle (lift, hammer, etc.)
 *  - Entrances with room IDs and positions
 *  - Obstacles detected on this screen
 *  - Review status + comment for each item (like sprite review)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';

interface PointReview {
  status: ReviewStatus;
  comment?: string;
  /** User-corrected requirements (overrides auto-detected) */
  correctedRequirements?: string[][];
  /** User-corrected transit type */
  correctedTransitType?: string;
}

interface ScreenReview {
  status: ReviewStatus;
  comment?: string;
  points: Record<string, PointReview>;
}

type NavReviewData = Record<string, ScreenReview>;

interface BorderBundle {
  id: string;
  direction: 'n' | 's' | 'e' | 'w';
  tiles: number[];
  requirements: string[][];
}

interface EntranceInfo {
  id: number;
  roomId: number;
  gridRow: number;
  gridCol: number;
}

interface TransitionInfo {
  entranceIdx: number;
  requirements: string[];
}

interface NavReviewPanelProps {
  locationKey: string;
  bundles: BorderBundle[];
  entrances: EntranceInfo[];
  transitions: TransitionInfo[];
  borders: {
    north: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
    south: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
    east: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
    west: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
  };
  reachableCount: number;
  totalTiles: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────────────

function NavReviewPanel({ locationKey, bundles, entrances, transitions, borders, reachableCount, totalTiles }: NavReviewPanelProps) {
  const [reviewData, setReviewData] = useState<NavReviewData>({});
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load review data
  useEffect(() => {
    window.api.loadNavReview().then((d: unknown) => setReviewData((d ?? {}) as NavReviewData));
  }, []);

  const persist = useCallback((next: NavReviewData) => {
    setReviewData(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => window.api.saveNavReview(next), 400);
  }, []);

  const screenReview = reviewData[locationKey] ?? { status: 'neutral' as ReviewStatus, comment: '', points: {} };

  // Screen-level review
  const setScreenStatus = (status: ReviewStatus) => {
    const next = { ...reviewData, [locationKey]: { ...screenReview, status } };
    persist(next);
  };
  const setScreenComment = (comment: string) => {
    const next = { ...reviewData, [locationKey]: { ...screenReview, comment } };
    persist(next);
  };

  // Point-level review
  const getPointReview = (pointId: string): PointReview => screenReview.points[pointId] ?? { status: 'neutral' };
  const setPointStatus = (pointId: string, status: ReviewStatus) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), status } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };
  const setPointComment = (pointId: string, comment: string) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), comment } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };
  const setPointRequirements = (pointId: string, reqs: string[][]) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), correctedRequirements: reqs } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };
  const setPointTransitType = (pointId: string, transitType: string) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), correctedTransitType: transitType } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };

  const toggleExpand = (id: string) => {
    setExpandedPoints(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Group bundles by direction
  const bundlesByDir = { n: [] as BorderBundle[], s: [] as BorderBundle[], e: [] as BorderBundle[], w: [] as BorderBundle[] };
  for (const b of bundles) bundlesByDir[b.direction].push(b);

  // Compute summary
  const totalBundles = bundles.length;
  const reviewedCount = Object.values(screenReview.points).filter(p => p.status !== 'neutral').length;
  const totalPoints = bundles.length + entrances.length;

  return (
    <div style={S.panel}>
      {/* Screen summary */}
      <div style={S.header}>
        <span style={S.headerTitle}>Nav Review</span>
        <span style={S.badge}>{reviewedCount}/{totalPoints}</span>
      </div>

      <div style={S.summary}>
        {reachableCount}/{totalTiles} tiles · {totalBundles} border bundle{totalBundles !== 1 ? 's' : ''} · {entrances.length} entrance{entrances.length !== 1 ? 's' : ''}
      </div>

      {/* Screen-level review */}
      <div style={S.screenReview}>
        <StatusRow status={screenReview.status} comment={screenReview.comment} onStatus={setScreenStatus} onComment={setScreenComment} />
      </div>

      {/* Border Bundles by direction */}
      {(['n', 's', 'e', 'w'] as const).map(dir => {
        const dirBundles = bundlesByDir[dir];
        if (dirBundles.length === 0) return null;

        const borderData = borders[dir === 'n' ? 'north' : dir === 's' ? 'south' : dir === 'e' ? 'east' : 'west'];
        const gatedCount = borderData.itemTiles.length;

        return (
          <div key={dir} style={S.dirSection}>
            <div style={S.dirHeader}>
              <span style={{ ...S.dirDot, background: DIR_COLORS[dir] }} />
              <span style={S.dirLabel}>{DIR_LABELS[dir]}</span>
              <span style={S.dirMeta}>
                {borderData.freeTiles.length} free{gatedCount > 0 ? ` + ${gatedCount} gated` : ''}
                · {dirBundles.length} bundle{dirBundles.length !== 1 ? 's' : ''}
              </span>
            </div>

            {dirBundles.map(bundle => {
              const review = getPointReview(bundle.id);
              const expanded = expandedPoints.has(bundle.id);
              const effectiveReqs = review.correctedRequirements ?? bundle.requirements;

              return (
                <div key={bundle.id} style={{ ...S.pointCard, borderLeftColor: DIR_COLORS[dir] }}>
                  <div style={S.pointHeader} onClick={() => toggleExpand(bundle.id)}>
                    <span style={S.expandIcon}>{expanded ? '▾' : '▸'}</span>
                    <span style={S.pointTitle}>{bundle.id}</span>
                    <span style={S.tileBadge}>
                      {dir === 'n' || dir === 's' ? `${bundle.tiles.length}×1` : `1×${bundle.tiles.length}`}
                    </span>
                    {review.status !== 'neutral' && <span style={{ ...S.statusIcon, color: STATUS_BTNS.find(b => b.key === review.status)?.color }}>{STATUS_BTNS.find(b => b.key === review.status)?.label}</span>}
                  </div>

                  {expanded && (
                    <div style={S.pointBody}>
                      <div style={S.fieldRow}>
                        <span style={S.fieldLabel}>Tiles:</span>
                        <span style={S.fieldValue}>[{bundle.tiles[0]}–{bundle.tiles[bundle.tiles.length - 1]}]</span>
                      </div>
                      <div style={S.fieldRow}>
                        <span style={S.fieldLabel}>Requirements:</span>
                        <span style={S.fieldValue}>
                          {effectiveReqs.length === 0 ? 'none (free)' : effectiveReqs.map(r => r.join(' + ')).join(' OR ')}
                          {review.correctedRequirements && <span style={S.correctedBadge}>corrected</span>}
                        </span>
                      </div>

                      {/* Requirement editor */}
                      <RequirementEditor
                        current={effectiveReqs}
                        onChange={reqs => setPointRequirements(bundle.id, reqs)}
                      />

                      <StatusRow status={review.status} comment={review.comment} onStatus={s => setPointStatus(bundle.id, s)} onComment={c => setPointComment(bundle.id, c)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Entrances */}
      {entrances.length > 0 && (
        <div style={S.dirSection}>
          <div style={S.dirHeader}>
            <span style={{ ...S.dirDot, background: '#ffcc44' }} />
            <span style={S.dirLabel}>Entrances</span>
            <span style={S.dirMeta}>{entrances.length} door{entrances.length !== 1 ? 's' : ''}</span>
          </div>

          {entrances.map(ent => {
            const pointId = `entrance-${ent.id}`;
            const review = getPointReview(pointId);
            const expanded = expandedPoints.has(pointId);
            const transition = transitions.find(t => t.entranceIdx === ent.id);

            return (
              <div key={pointId} style={{ ...S.pointCard, borderLeftColor: '#ffcc44' }}>
                <div style={S.pointHeader} onClick={() => toggleExpand(pointId)}>
                  <span style={S.expandIcon}>{expanded ? '▾' : '▸'}</span>
                  <span style={S.pointTitle}>Room 0x{ent.roomId.toString(16).toUpperCase()} (#{ent.id})</span>
                  <span style={S.tileBadge}>2×2</span>
                  {review.status !== 'neutral' && <span style={{ ...S.statusIcon, color: STATUS_BTNS.find(b => b.key === review.status)?.color }}>{STATUS_BTNS.find(b => b.key === review.status)?.label}</span>}
                </div>

                {expanded && (
                  <div style={S.pointBody}>
                    <div style={S.fieldRow}>
                      <span style={S.fieldLabel}>Position:</span>
                      <span style={S.fieldValue}>row {ent.gridRow}, col {ent.gridCol}</span>
                    </div>
                    <div style={S.fieldRow}>
                      <span style={S.fieldLabel}>Room ID:</span>
                      <span style={S.fieldValue}>0x{ent.roomId.toString(16).toUpperCase()}</span>
                    </div>
                    <div style={S.fieldRow}>
                      <span style={S.fieldLabel}>Requirements:</span>
                      <span style={S.fieldValue}>{transition?.requirements.length ? transition.requirements.join(', ') : 'none (free)'}</span>
                    </div>
                    <div style={S.fieldRow}>
                      <span style={S.fieldLabel}>Transit type:</span>
                      <TransitTypePicker
                        value={review.correctedTransitType ?? 'door'}
                        onChange={t => setPointTransitType(pointId, t)}
                      />
                    </div>

                    <RequirementEditor
                      current={review.correctedRequirements ?? (transition?.requirements.length ? [transition.requirements] : [])}
                      onChange={reqs => setPointRequirements(pointId, reqs)}
                    />

                    <StatusRow status={review.status} comment={review.comment} onStatus={s => setPointStatus(pointId, s)} onComment={c => setPointComment(pointId, c)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusRow({ status, comment, onStatus, onComment }: { status: ReviewStatus; comment?: string; onStatus: (s: ReviewStatus) => void; onComment: (c: string) => void }) {
  return (
    <div style={S.reviewRow}>
      <div style={S.statusRow}>
        {STATUS_BTNS.map(b => (
          <button key={b.key} onClick={() => onStatus(b.key)} style={{ ...S.statusBtn, ...(status === b.key ? { color: b.color, borderColor: b.color } : {}) }}>
            {b.label}
          </button>
        ))}
      </div>
      {(status === 'bad' || status === 'yellow' || comment) && (
        <input style={S.commentInput} placeholder="Note..." value={comment ?? ''} onChange={e => onComment(e.target.value)} />
      )}
    </div>
  );
}

function RequirementEditor({ current, onChange }: { current: string[][]; onChange: (reqs: string[][]) => void }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(current.flat()));

  if (!editing) {
    return (
      <button style={S.editBtn} onClick={() => { setSelected(new Set(current.flat())); setEditing(true); }}>
        ✏️ Edit requirements
      </button>
    );
  }

  const toggle = (req: string) => {
    const next = new Set(selected);
    if (next.has(req)) next.delete(req); else next.add(req);
    setSelected(next);
  };

  const apply = () => {
    const reqs = selected.size > 0 ? [Array.from(selected)] : [];
    onChange(reqs);
    setEditing(false);
  };

  return (
    <div style={S.reqEditor}>
      <div style={S.reqGrid}>
        {REQUIREMENT_OPTIONS.map(req => (
          <button key={req} onClick={() => toggle(req)} style={{ ...S.reqChip, ...(selected.has(req) ? S.reqChipActive : {}) }}>
            {req}
          </button>
        ))}
      </div>
      <div style={S.reqActions}>
        <button style={S.editBtn} onClick={apply}>Apply</button>
        <button style={S.editBtn} onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}

function TransitTypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = ['door', 'passage', 'hole', 'ledge', 'staircase', 'dungeon_enter', 'whirlpool', 'warp_tile'];
  return (
    <select style={S.selectInput} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

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

export { NavReviewPanel };
export type { NavReviewData, ScreenReview, PointReview, BorderBundle };
