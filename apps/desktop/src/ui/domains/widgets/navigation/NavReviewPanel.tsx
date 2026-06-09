/* @layer renderer-widgets @kind component */
/**
 * NavReviewPanel — per-screen connection point review with comments.
 * State/handlers live in nav-review/useNavReview; styles, types, and input
 * controls live in nav-review/*.
 */

import { Box, Text } from '../../../design-system/primitives';
import type { NavReviewPanelProps, BorderBundle } from './nav-review/nav-review.type';
import { DIR_LABELS, DIR_COLORS, STATUS_BTNS, S } from './nav-review/nav-review-styles';
import { StatusRow, RequirementEditor, TransitTypePicker } from './nav-review/nav-review-controls';
import { NavFieldRow } from './nav-review/NavFieldRow';
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
    <Box style={S.panel}>
      {/* Screen summary */}
      <Box style={S.header}>
        <Text style={S.headerTitle}>Nav Review</Text>
        <Text style={S.badge}>{reviewedCount}/{totalPoints}</Text>
      </Box>

      <Box style={S.summary}>
        {reachableCount}/{totalTiles} tiles · {totalBundles} border bundle{totalBundles !== 1 ? 's' : ''} · {entrances.length} entrance{entrances.length !== 1 ? 's' : ''}
      </Box>

      {/* Screen-level review */}
      <Box style={S.screenReview}>
        <StatusRow status={screenReview.status} comment={screenReview.comment} onStatus={setScreenStatus} onComment={setScreenComment} />
      </Box>

      {/* Border Bundles by direction */}
      {(['n', 's', 'e', 'w'] as const).map(dir => {
        const dirBundles = bundlesByDir[dir];
        if (dirBundles.length === 0) return null;

        const borderData = borders[dir === 'n' ? 'north' : dir === 's' ? 'south' : dir === 'e' ? 'east' : 'west'];
        const gatedCount = borderData.itemTiles.length;

        return (
          <Box key={dir} style={S.dirSection}>
            <Box style={S.dirHeader}>
              <Box style={{ ...S.dirDot, background: DIR_COLORS[dir] }} />
              <Text style={S.dirLabel}>{DIR_LABELS[dir]}</Text>
              <Text style={S.dirMeta}>
                {borderData.freeTiles.length} free{gatedCount > 0 ? ` + ${gatedCount} gated` : ''}
                · {dirBundles.length} bundle{dirBundles.length !== 1 ? 's' : ''}
              </Text>
            </Box>

            {dirBundles.map(bundle => {
              const review = getPointReview(bundle.id);
              const expanded = expandedPoints.has(bundle.id);
              const effectiveReqs = review.correctedRequirements ?? bundle.requirements;

              return (
                <Box key={bundle.id} style={{ ...S.pointCard, borderLeftColor: DIR_COLORS[dir] }}>
                  <Box style={S.pointHeader} onClick={() => toggleExpand(bundle.id)}>
                    <Text style={S.expandIcon}>{expanded ? '▾' : '▸'}</Text>
                    <Text style={S.pointTitle}>{bundle.id}</Text>
                    <Text style={S.tileBadge}>
                      {dir === 'n' || dir === 's' ? `${bundle.tiles.length}×1` : `1×${bundle.tiles.length}`}
                    </Text>
                    {review.status !== 'neutral' && <Text style={{ ...S.statusIcon, color: STATUS_BTNS.find(b => b.key === review.status)?.color }}>{STATUS_BTNS.find(b => b.key === review.status)?.label}</Text>}
                  </Box>

                  {expanded && (
                    <Box style={S.pointBody}>
                      <NavFieldRow label="Tiles:">[{bundle.tiles[0]}–{bundle.tiles[bundle.tiles.length - 1]}]</NavFieldRow>
                      <NavFieldRow label="Requirements:">
                        {effectiveReqs.length === 0 ? 'none (free)' : effectiveReqs.map(r => r.join(' + ')).join(' OR ')}
                        {review.correctedRequirements && <Text style={S.correctedBadge}>corrected</Text>}
                      </NavFieldRow>

                      {/* Requirement editor */}
                      <RequirementEditor
                        current={effectiveReqs}
                        onChange={reqs => setPointRequirements(bundle.id, reqs)}
                      />

                      <StatusRow status={review.status} comment={review.comment} onStatus={s => setPointStatus(bundle.id, s)} onComment={c => setPointComment(bundle.id, c)} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        );
      })}

      {/* Entrances */}
      {entrances.length > 0 && (
        <Box style={S.dirSection}>
          <Box style={S.dirHeader}>
            <Box style={{ ...S.dirDot, background: 'var(--c-gold)' }} />
            <Text style={S.dirLabel}>Entrances</Text>
            <Text style={S.dirMeta}>{entrances.length} door{entrances.length !== 1 ? 's' : ''}</Text>
          </Box>

          {entrances.map(ent => {
            const pointId = `entrance-${ent.id}`;
            const review = getPointReview(pointId);
            const expanded = expandedPoints.has(pointId);
            const transition = transitions.find(t => t.entranceIdx === ent.id);

            return (
              <Box key={pointId} style={{ ...S.pointCard, borderLeftColor: 'var(--c-gold)' }}>
                <Box style={S.pointHeader} onClick={() => toggleExpand(pointId)}>
                  <Text style={S.expandIcon}>{expanded ? '▾' : '▸'}</Text>
                  <Text style={S.pointTitle}>Room 0x{ent.roomId.toString(16).toUpperCase()} (#{ent.id})</Text>
                  <Text style={S.tileBadge}>2×2</Text>
                  {review.status !== 'neutral' && <Text style={{ ...S.statusIcon, color: STATUS_BTNS.find(b => b.key === review.status)?.color }}>{STATUS_BTNS.find(b => b.key === review.status)?.label}</Text>}
                </Box>

                {expanded && (
                  <Box style={S.pointBody}>
                    <NavFieldRow label="Position:">row {ent.gridRow}, col {ent.gridCol}</NavFieldRow>
                    <NavFieldRow label="Room ID:">0x{ent.roomId.toString(16).toUpperCase()}</NavFieldRow>
                    <NavFieldRow label="Requirements:">{transition?.requirements.length ? transition.requirements.join(', ') : 'none (free)'}</NavFieldRow>
                    <Box style={S.fieldRow}>
                      <Text style={S.fieldLabel}>Transit type:</Text>
                      <TransitTypePicker
                        value={review.correctedTransitType ?? 'door'}
                        onChange={t => setPointTransitType(pointId, t)}
                      />
                    </Box>

                    <RequirementEditor
                      current={review.correctedRequirements ?? (transition?.requirements.length ? [transition.requirements] : [])}
                      onChange={reqs => setPointRequirements(pointId, reqs)}
                    />

                    <StatusRow status={review.status} comment={review.comment} onStatus={s => setPointStatus(pointId, s)} onComment={c => setPointComment(pointId, c)} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export { NavReviewPanel };
export type { NavReviewData, ScreenReview, PointReview, BorderBundle } from './nav-review/nav-review.type';
