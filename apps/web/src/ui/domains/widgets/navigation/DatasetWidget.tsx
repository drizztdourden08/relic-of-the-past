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
import { wasmGetProgressIndicator, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetRoomStairInfo, wasmGetFallHoles, wasmGetAreaHeads } from '../../../../lib/game';
import { connectionTagKeysOf } from '@shared/game/data';
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
      // describeConnectionTiles/connectionIssues take the editor's plain
      // {from,to,tags} shape, not ConnectionRecord's fromScreenId/toScreenId.
      const conn = { from: c.fromScreenId, to: c.toScreenId, tags: connectionTagKeysOf(c.tags) };
      const tileDesc = describeConnectionTiles(conn, floodConnections, screenId);
      return connectionIssues(conn, tileDesc).length > 0 ? n + 1 : n;
    }, 0);
  }, [connStatus.existingConnections, floodConnections, screenStatus.screen]);
  const realTransitions = useRealTransitions(isIndoors, roomIndex, floodConnections, overworldScreenIndex);
  const realAvailable = isIndoors ? screenStatus.screen != null : floodConnections.length > 0;
  const audit = useConnectionAudit({ screenId: screenStatus.screen?.id ?? null, unmatched: connStatus.unmatched, realTransitions, realAvailable, floodConnections });

  // Review helpers. Keyed by the screen's frozen id — a review note follows the
  // record, not a synthesized index string. An unrecognised screen has nothing to
  // key on, so reviewing is simply unavailable until the screen is in the dataset.
  const locationKey = screenStatus.screen?.id ?? null;
  const locationReview = (locationKey ? reviewData[locationKey] : undefined)
    ?? { status: 'neutral' as ReviewStatus, connections: {} };

  const setLocStatus = (status: ReviewStatus) => {
    if (!locationKey) return;
    setReviewData(prev => {
      const entry = prev[locationKey] ?? { status: 'neutral', connections: {} };
      const next = { ...prev, [locationKey]: { ...entry, status } };
      persist(next);
      return next;
    });
  };
  const setLocComment = (comment: string) => {
    if (!locationKey) return;
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
        gameState={{ roomIndex, overworldIndex: overworldScreenIndex, palaceIndex, isIndoors, isDarkWorld }}
      />
      <ConnectionEditorDialog
        open={connEditorOpen}
        onClose={() => setConnEditorOpen(false)}
        screenId={screenStatus.screen?.id ?? null}
        screen={screenStatus.screen}
        existingConnections={connStatus.existingConnections}
        unmatchedConnections={connStatus.unmatched}
      />
    </Box>
  );
};

export { DatasetWidgetContent };
