/* @layer renderer-widgets @kind component */
/**
 * DatasetWidgetContent — "Dataset & Mapping" widget.
 *
 * Shows dataset status, screen mapping, connection coverage, review controls,
 * and editor dialogs for managing the navigation dataset.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { getDungeonName } from '@shared/game/data/screens/game-values';
import { wasmGetProgressIndicator, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetRoomStairInfo } from '../../../../lib/game';
import { useScreenDataStatus, useConnectionStatus } from './useDatasetStatus';
import { ScreenEditorDialog } from './ScreenEditorDialog';
import { ConnectionEditorDialog } from './ConnectionEditorDialog';
import { Box, Text, StatusBadge } from '../../../design-system/primitives';
import { useScreenDetection } from './hooks';
import type { ReviewStatus, ReviewData } from './dataset-widget-types';
import { S } from './dataset-widget-styles';
import { StatusRow } from './StatusRow';
import { DatasetStatusPill } from './DatasetStatusPill';

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
    <Box style={S.root}>
      {/* ═══ DATASET STATUS ═══ */}
      <Box style={S.section}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
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
              <Text style={{ color: 'var(--c-warning)', fontSize: 10 }}>Default entry — no variant for "{progressInfo.label}"</Text>
            </Box>
          )}
          {screenStatus.issues.length > 0 && (
            <Box style={S.infoRow}>
              <Text style={S.infoLabel}>Issues</Text>
              <Text style={{ color: 'var(--c-warning)', fontSize: 10 }}>{screenStatus.issues.join(', ')}</Text>
            </Box>
          )}
          {screenStatus.corrections.length > 0 && (
            <Box style={{ padding: '3px 6px', marginTop: 2, borderRadius: 'var(--r-sm)', background: 'var(--c-warning-soft)', border: '1px solid var(--c-warning-soft)' }}>
              <Box style={{ fontSize: 9, color: 'var(--c-warning)', fontWeight: 600, marginBottom: 2 }}>⚠ Suggested Corrections</Box>
              {screenStatus.corrections.map((c, i) => (
                <Box key={i} style={{ fontSize: 10, color: 'var(--c-text-dim)', lineHeight: '14px' }}>
                  <Text style={{ color: 'var(--c-info)' }}>{c.field}</Text>: {c.message}
                </Box>
              ))}
            </Box>
          )}
          <Box style={S.infoRow}>
            <Text style={S.infoLabel}>Connections</Text>
            <Text>{connStatus.existingConnections.length} in dataset{connStatus.missingCount > 0 ? `, ${connStatus.missingCount} detected not mapped` : ''}</Text>
          </Box>
        </Box>
        <Box style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <Box as="button" style={S.btn} onClick={() => setScreenEditorOpen(true)}>
            ✏️ Edit Screen
          </Box>
          <Box as="button" style={S.btn} onClick={() => setConnEditorOpen(true)}>
            ✏️ Edit Connections
          </Box>
        </Box>
      </Box>

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
