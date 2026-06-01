/**
 * DatasetWidgetContent — "Dataset & Mapping" widget.
 *
 * Shows dataset status, screen mapping, connection coverage, review controls,
 * and editor dialogs for managing the navigation dataset.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameUIStore } from '../../stores/game-ui-store';
import { resolveCurrentScreenDetailed } from '@shared/game/data/screens';
import type { ScreenMatchResult, VariantGameState } from '@shared/game/data/screens';
import { getDungeonName } from '@shared/game/data/screens/game-values';
import { wasmGetProgressIndicator, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetRoomStairInfo } from '../../lib/game';
import { getCompletedChecks } from '../../lib/game/tracker';
import { useScreenDataStatus, useConnectionStatus } from './useDatasetStatus';
import { ScreenEditorDialog } from './ScreenEditorDialog';
import { ConnectionEditorDialog } from './ConnectionEditorDialog';
import { StatusBadge } from '../../components/primitives';

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';
interface ReviewEntry { status: ReviewStatus; comment?: string; }
interface LocationReview { status: ReviewStatus; comment?: string; connections: Record<string, ReviewEntry>; }
type ReviewData = Record<string, LocationReview>;

const STATUS_BTNS: { key: ReviewStatus; label: string; color: string }[] = [
  { key: 'neutral', label: '—', color: '#666' },
  { key: 'good', label: '✓', color: '#4c4' },
  { key: 'bad', label: '✗', color: '#f44' },
  { key: 'yellow', label: '⚠', color: '#fc4' },
];

function DatasetWidgetContent() {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex, whichEntrance } = useGameUIStore(s => s.map);

  const [reviewData, setReviewData] = useState<ReviewData>({});
  const [screenEditorOpen, setScreenEditorOpen] = useState(false);
  const [connEditorOpen, setConnEditorOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load review data
  useEffect(() => {
    window.api.loadConnectionReview().then((d: unknown) => setReviewData((d ?? {}) as ReviewData));
  }, []);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => window.api.saveConnectionReview(next), 300);
  }, []);

  const locationKey = isIndoors
    ? `room-${roomIndex.toString(16).padStart(3, '0')}`
    : `${isDarkWorld ? 'dw' : 'lw'}-${overworldScreenIndex.toString(16).padStart(2, '0')}`;

  // Screen detection
  const progressInfo = wasmGetProgressIndicator();
  const variantState = useMemo<VariantGameState>(() => ({
    completedChecks: getCompletedChecks(),
    entranceId: whichEntrance ?? undefined,
    progressTier: progressInfo?.tier,
  }), [whichEntrance, progressInfo?.tier]);

  const detectionResult = useMemo<ScreenMatchResult | null>(
    () => resolveCurrentScreenDetailed(isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState),
    [isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState],
  );

  // Dataset status
  const screenStatus = useScreenDataStatus(detectionResult, isIndoors);

  const detectedEntranceScreens = useMemo(() => {
    if (!isIndoors) return [];
    const rooms = wasmGetEntranceRooms();
    const exitMap = wasmGetExitScreenMap();
    const exitScreen = exitMap.get(roomIndex);
    if (!rooms || exitScreen == null) return [];
    return [exitScreen];
  }, [isIndoors, roomIndex]);

  const detectedStairs = useMemo(() => {
    if (!isIndoors) return [];
    return wasmGetRoomStairInfo();
  }, [isIndoors, roomIndex]);

  const exitScreen = useMemo(() => {
    if (!isIndoors) return null;
    return wasmGetExitScreenMap().get(roomIndex) ?? null;
  }, [isIndoors, roomIndex]);

  const connStatus = useConnectionStatus(
    screenStatus.screen?.id ?? null,
    detectedEntranceScreens,
    detectedStairs,
    exitScreen,
  );

  // Review helpers
  const locationReview = reviewData[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };

  const setLocStatus = (status: ReviewStatus) => {
    setReviewData(prev => {
      const entry = prev[locationKey] ?? { status: 'neutral', connections: {} };
      const next = { ...prev, [locationKey]: { ...entry, status } };
      persist(next);
      return next;
    });
  };
  const setLocComment = (comment: string) => {
    setReviewData(prev => {
      const entry = prev[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
      const next = { ...prev, [locationKey]: { ...entry, comment } };
      persist(next);
      return next;
    });
  };

  return (
    <div style={S.root}>
      {/* ═══ DATASET STATUS ═══ */}
      <div style={S.section}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={S.sectionTitle}>Dataset</div>
          <span style={{
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 3,
            background: screenStatus.status === 'mapped' ? '#1a3a1a' : screenStatus.status === 'incomplete' ? '#3a3a1a' : '#3a1a1a',
            color: screenStatus.status === 'mapped' ? '#4f8' : screenStatus.status === 'incomplete' ? '#fc6' : '#f66',
            fontWeight: 600,
          }}>
            {screenStatus.status === 'mapped' ? '✓ Screen' : screenStatus.status === 'incomplete' ? '⚠ Screen' : '✗ Screen'}
          </span>
          <span style={{
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 3,
            background: connStatus.status === 'complete' ? '#1a3a1a' : connStatus.status === 'partial' ? '#3a3a1a' : '#2a2a2a',
            color: connStatus.status === 'complete' ? '#4f8' : connStatus.status === 'partial' ? '#fc6' : '#666',
            fontWeight: 600,
          }}>
            {connStatus.status === 'complete' ? '✓ Conns' : connStatus.status === 'partial' ? `⚠ ${connStatus.missingCount} missing` : '— Conns'}
          </span>
        </div>
        <div style={S.infoBox}>
          <div style={S.infoRow}>
            <span style={S.infoLabel}>Screen</span>
            <span style={{ color: screenStatus.screen ? '#7f7' : '#f66' }}>
              {screenStatus.screen ? screenStatus.screen.id : 'Not mapped'}
            </span>
          </div>
          {detectionResult && (
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Match</span>
              <span style={{ color: detectionResult.method === 'exact' || detectionResult.method === 'overworld' ? '#4f8' : detectionResult.method === 'entrance' ? '#8cf' : '#fc6' }}>
                {detectionResult.method}
              </span>
            </div>
          )}
          {screenStatus.screen && (
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Name</span>
              <span>{screenStatus.screen.name}</span>
            </div>
          )}
          {screenStatus.screen && (
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Status</span>
              <StatusBadge status={screenStatus.screen.status} />
            </div>
          )}
          {screenStatus.screen && !screenStatus.screen.variant && detectionResult?.method === 'cave-ambiguous' && progressInfo && (
            <div style={S.infoRow}>
              <span style={S.infoLabel}>⚠️</span>
              <span style={{ color: '#fa0', fontSize: 10 }}>Default entry — no variant for "{progressInfo.label}"</span>
            </div>
          )}
          {screenStatus.issues.length > 0 && (
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Issues</span>
              <span style={{ color: '#fc6', fontSize: 10 }}>{screenStatus.issues.join(', ')}</span>
            </div>
          )}
          {screenStatus.corrections.length > 0 && (
            <div style={{ padding: '3px 6px', marginTop: 2, borderRadius: 3, background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)' }}>
              <div style={{ fontSize: 9, color: '#fa0', fontWeight: 600, marginBottom: 2 }}>⚠ Suggested Corrections</div>
              {screenStatus.corrections.map((c, i) => (
                <div key={i} style={{ fontSize: 10, color: '#dda', lineHeight: '14px' }}>
                  <span style={{ color: '#8cf' }}>{c.field}</span>: {c.message}
                </div>
              ))}
            </div>
          )}
          <div style={S.infoRow}>
            <span style={S.infoLabel}>Connections</span>
            <span>{connStatus.existingConnections.length} in dataset{connStatus.missingCount > 0 ? `, ${connStatus.missingCount} detected not mapped` : ''}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <button style={S.btn} onClick={() => setScreenEditorOpen(true)}>
            ✏️ Edit Screen
          </button>
          <button style={S.btn} onClick={() => setConnEditorOpen(true)}>
            ✏️ Edit Connections
          </button>
        </div>
      </div>

      {/* ═══ REVIEW ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Review</div>
        <StatusRow status={locationReview.status} comment={locationReview.comment} onStatus={setLocStatus} onComment={setLocComment} />
      </div>

      {/* ═══ Editor Dialogs ═══ */}
      <ScreenEditorDialog
        open={screenEditorOpen}
        onClose={() => setScreenEditorOpen(false)}
        existingScreen={screenStatus.screen}
        gameState={{ roomIndex, palaceIndex, isIndoors, isDarkWorld }}
      />
      <ConnectionEditorDialog
        open={connEditorOpen}
        onClose={() => setConnEditorOpen(false)}
        screenId={screenStatus.screen?.id ?? null}
        screenMeta={screenStatus.screen ? { type: screenStatus.screen.type, dungeon: screenStatus.screen.type === 'dungeon' ? getDungeonName(screenStatus.screen.dungeon.palaceIndex) : undefined, isDarkWorld } : null}
        existingConnections={connStatus.existingConnections}
        unmatchedConnections={connStatus.unmatched}
      />
    </div>
  );
}

// ─── StatusRow ─────────────────────────────────────────────────────────

function StatusRow({ status, comment, onStatus, onComment }: { status: ReviewStatus; comment?: string; onStatus: (s: ReviewStatus) => void; onComment: (c: string) => void }) {
  return (
    <div>
      <div style={S.statusRow}>
        {STATUS_BTNS.map(b => (
          <button key={b.key} onClick={() => onStatus(b.key)} style={{ ...S.statusBtn, ...(status === b.key ? { color: b.color, borderColor: b.color } : {}) }}>
            {b.label}
          </button>
        ))}
      </div>
      {(status === 'bad' || status === 'yellow') && (
        <input style={S.commentInput} placeholder="Note..." value={comment ?? ''} onChange={e => onComment(e.target.value)} />
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

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

export { DatasetWidgetContent };
