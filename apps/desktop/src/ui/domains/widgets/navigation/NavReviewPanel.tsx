/* @layer renderer-widgets @kind component */
/**
 * NavReviewPanel — per-screen connection point review with comments.
 * State/handlers live in nav-review/useNavReview; styles, types, and input
 * controls live in nav-review/*.
 */

import type { NavReviewPanelProps, BorderBundle } from './nav-review/nav-review.type';
import { DIR_LABELS, DIR_COLORS, STATUS_BTNS, S } from './nav-review/nav-review-styles';
import { StatusRow, RequirementEditor, TransitTypePicker } from './nav-review/nav-review-controls';
import { useNavReview } from './nav-review/useNavReview';

const NavReviewPanel = ({ locationKey, bundles, entrances, transitions, borders, reachableCount, totalTiles }: NavReviewPanelProps) => {
  const {
    screenReview, expandedPoints, toggleExpand,
    setScreenStatus, setScreenComment, getPointReview,
    setPointStatus, setPointComment, setPointRequirements, setPointTransitType,
  } = useNavReview(locationKey);

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
};

export { NavReviewPanel };
export type { NavReviewData, ScreenReview, PointReview, BorderBundle } from './nav-review/nav-review.type';
