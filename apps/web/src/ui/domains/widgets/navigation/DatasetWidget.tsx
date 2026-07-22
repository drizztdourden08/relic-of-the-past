/* @layer renderer-widgets @kind component */
/**
 * DatasetWidgetContent — "Dataset & Mapping" widget.
 *
 * Shows dataset status, screen mapping, connection coverage, review controls,
 * and editor dialogs for managing the navigation dataset.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import { getDungeonName } from '@shared/game/data/screens/game-values';
import { wasmGetProgressIndicator, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetRoomStairInfo, wasmGetFallHoles, wasmGetAreaHeads } from '../../../../lib/game';
import { useScreenDataStatus, useConnectionStatus } from './useDatasetStatus';
import { describeConnectionTiles } from './connection-tile-display';
import { connectionIssues } from './connection-issues';
import { useConnectionAudit } from './useConnectionAudit';
import { useRealTransitions } from './useRealTransitions';
import { ConnectionAuditSection } from './ConnectionAuditSection';
import { ScreenEditorDialog } from './ScreenEditorDialog';
import { ConnectionEditorDialog } from './ConnectionEditorDialog';
import { Box, Text, StatusBadge, Button } from '../../../design-system/primitives';
import { useScreenDetection } from './hooks';
import type { ReviewStatus, ReviewData } from './dataset-widget-types';
import { S } from './dataset-widget-styles';
import { StatusRow } from './StatusRow';
import { DatasetStatusPill } from './DatasetStatusPill';

// Static inline-style literals (dynamic/conditional styles stay inline).
const IL: Record<string, CSSProperties> = {
  statusHead: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  warnText: { color: 'var(--c-warning)', fontSize: 10 },
  corrBox: { padding: '3px 6px', marginTop: 2, borderRadius: 'var(--r-sm)', background: 'var(--c-warning-soft)', border: '1px solid var(--c-warning-soft)' },
  corrTitle: { fontSize: 9, color: 'var(--c-warning)', fontWeight: 600, marginBottom: 2 },
  corrItem: { fontSize: 10, color: 'var(--c-text-dim)', lineHeight: '14px' },
  corrField: { color: 'var(--c-info)' },
  btnRow: { display: 'flex', gap: 4, marginTop: 4 },
};

const DatasetWidgetContent = () => {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex } = useGameUIStore(s => s.map);

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
  const detectionResult = useScreenDetection();
  const progressInfo = wasmGetProgressIndicator();

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

  // Fall holes on the current overworld area, resolved entrance-id → room via
  // the same head-group comparison useRealTransitions' collectFallHoles uses.
  const detectedFallHoleRooms = useMemo(() => {
    if (isIndoors) return [];
    const heads = wasmGetAreaHeads();
    const entranceRooms = wasmGetEntranceRooms();
    const currentHead = heads ? heads[overworldScreenIndex] : overworldScreenIndex;
    const rooms: number[] = [];
    for (const hole of wasmGetFallHoles()) {
      const holeHead = heads ? heads[hole.area] : hole.area;
      if (holeHead !== currentHead) continue;
      const room = entranceRooms?.[hole.entranceId];
      if (room != null && room !== 0) rooms.push(room);
    }
    return rooms;
  }, [isIndoors, overworldScreenIndex]);

  const connStatus = useConnectionStatus(
    screenStatus.screen?.id ?? null,
    detectedEntranceScreens,
    detectedStairs,
    exitScreen,
    detectedFallHoleRooms,
  );

  // Flood connections refresh the audit whenever the Navigation widget re-floods.
  const floodConnections = useNavigationOverlayStore(s => s.connections);

  // Count existing connections with completeness warnings so the reviewer sees
  // how many are incomplete, not just how many exist.
  const incompleteConnCount = useMemo(() => {
    const screenId = screenStatus.screen?.id ?? null;
    return connStatus.existingConnections.reduce((n, c) => {
      const tileDesc = describeConnectionTiles(c, floodConnections, screenId);
      return connectionIssues(c, tileDesc).length > 0 ? n + 1 : n;
    }, 0);
  }, [connStatus.existingConnections, floodConnections, screenStatus.screen]);
  const realTransitions = useRealTransitions(isIndoors, roomIndex, floodConnections, overworldScreenIndex);
  const realAvailable = isIndoors ? screenStatus.screen != null : floodConnections.length > 0;
  const audit = useConnectionAudit({ screenId: screenStatus.screen?.id ?? null, unmatched: connStatus.unmatched, realTransitions, realAvailable, floodConnections });

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
    <Box style={S.root}>
      {/* ═══ DATASET STATUS ═══ */}
      <Box style={S.section}>
        <Box style={IL.statusHead}>
          <Box style={S.sectionTitle}>Dataset</Box>
          <DatasetStatusPill
            background={screenStatus.status === 'mapped' ? '#1a3a1a' : screenStatus.status === 'incomplete' ? '#3a3a1a' : '#3a1a1a'}
            color={screenStatus.status === 'mapped' ? 'var(--c-green)' : screenStatus.status === 'incomplete' ? 'var(--c-warning)' : 'var(--c-danger)'}
          >
            {screenStatus.status === 'mapped' ? '✓ Screen' : screenStatus.status === 'incomplete' ? '⚠ Screen' : '✗ Screen'}
          </DatasetStatusPill>
          <DatasetStatusPill
            background={connStatus.status === 'complete' ? '#1a3a1a' : connStatus.status === 'partial' ? '#3a3a1a' : '#2a2a2a'}
            color={connStatus.status === 'complete' ? 'var(--c-green)' : connStatus.status === 'partial' ? 'var(--c-warning)' : 'var(--c-text-muted)'}
          >
            {connStatus.status === 'complete' ? '✓ Conns' : connStatus.status === 'partial' ? `⚠ ${connStatus.missingCount} missing` : '— Conns'}
          </DatasetStatusPill>
        </Box>
        <Box style={S.infoBox}>
          <Box style={S.infoRow}>
            <Text style={S.infoLabel}>Screen</Text>
            <Text style={{ color: screenStatus.screen ? 'var(--c-green-bright)' : 'var(--c-danger)' }}>
              {screenStatus.screen ? screenStatus.screen.id : 'Not mapped'}
            </Text>
          </Box>
          {detectionResult && (
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Match</Text>
              <Text style={{ color: detectionResult.method === 'exact' || detectionResult.method === 'overworld' ? 'var(--c-green)' : detectionResult.method === 'entrance' ? 'var(--c-info)' : 'var(--c-warning)' }}>
                {detectionResult.method}
              </Text>
            </Box>
          )}
          {screenStatus.screen && (
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Name</Text>
              <Text>{screenStatus.screen.name}</Text>
            </Box>
          )}
          {screenStatus.screen && (
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Status</Text>
              <StatusBadge status={screenStatus.screen.status} />
            </Box>
          )}
          {screenStatus.screen && !screenStatus.screen.variant && detectionResult?.method === 'cave-ambiguous' && progressInfo && (
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>⚠️</Text>
              <Text style={IL.warnText}>Default entry — no variant for "{progressInfo.label}"</Text>
            </Box>
          )}
          {screenStatus.issues.length > 0 && (
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Issues</Text>
              <Text style={IL.warnText}>{screenStatus.issues.join(', ')}</Text>
            </Box>
          )}
          {screenStatus.corrections.length > 0 && (
            <Box style={IL.corrBox}>
              <Box style={IL.corrTitle}>⚠ Suggested Corrections</Box>
              {screenStatus.corrections.map((c, i) => (
                <Box key={i} style={IL.corrItem}>
                  <Text style={IL.corrField}>{c.field}</Text>: {c.message}
                </Box>
              ))}
            </Box>
          )}
          <Box style={S.infoRow}>
            <Text style={S.infoLabel}>Connections</Text>
            <Text>{connStatus.existingConnections.length} in dataset{connStatus.missingCount > 0 ? `, ${connStatus.missingCount} detected not mapped` : ''}{incompleteConnCount > 0 ? `, ${incompleteConnCount} incomplete` : ''}</Text>
          </Box>
        </Box>
        <Box style={IL.btnRow}>
          <Button variant="tertiary" size="sm" onClick={() => setScreenEditorOpen(true)}>
            ✏️ Edit Screen
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => setConnEditorOpen(true)}>
            ✏️ Edit Connections
          </Button>
        </Box>
      </Box>

      {/* ═══ CONNECTION AUDIT ═══ */}
      <ConnectionAuditSection badFindings={audit.badFindings} addFindings={audit.addFindings} />

      {/* ═══ REVIEW ═══ */}
      <Box style={S.section}>
        <Box style={S.sectionTitle}>Review</Box>
        <StatusRow status={locationReview.status} comment={locationReview.comment} onStatus={setLocStatus} onComment={setLocComment} />
      </Box>

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
    </Box>
  );
};

export { DatasetWidgetContent };
