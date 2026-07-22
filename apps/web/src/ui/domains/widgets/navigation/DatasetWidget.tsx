/* @layer renderer-widgets @kind component */
/**
 * DatasetWidgetContent — "Dataset & Mapping" widget.
 *
 * Shows dataset status, screen mapping, connection coverage, review controls,
 * and editor dialogs for managing the navigation dataset.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { DatasetStatusSection } from './DatasetStatusSection';
import { ScreenEditorDialog } from './ScreenEditorDialog';
import { ConnectionEditorDialog } from './ConnectionEditorDialog';
import { Box } from '../../../design-system/primitives';
import { useScreenDetection } from './hooks';
import type { ReviewStatus, ReviewData } from './dataset-widget-types';
import { S } from './dataset-widget-styles';
import { StatusRow } from './StatusRow';

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
      <DatasetStatusSection
        screenStatus={screenStatus}
        connStatus={connStatus}
        detectionResult={detectionResult}
        progressInfo={progressInfo}
        incompleteConnCount={incompleteConnCount}
        onEditScreen={() => setScreenEditorOpen(true)}
        onEditConnections={() => setConnEditorOpen(true)}
      />

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
