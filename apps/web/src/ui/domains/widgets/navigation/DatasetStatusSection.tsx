/* @layer renderer-widgets @kind component */
/**
 * DatasetStatusSection — the "Dataset" status block of the Dataset & Mapping
 * widget: screen/connection status pills, the detection info rows, suggested
 * corrections, and the edit-screen / edit-connections buttons. Presentational;
 * all derivation stays in DatasetWidgetContent.
 */

import type { CSSProperties } from 'react';
import { Box, Text, StatusBadge, Button } from '../../../design-system/primitives';
import { S } from './dataset-widget-styles';
import { DatasetStatusPill } from './DatasetStatusPill';
import type { useScreenDataStatus, useConnectionStatus } from './useDatasetStatus';
import type { useScreenDetection } from './hooks';
import type { wasmGetProgressIndicator } from '../../../../lib/game';

// Static inline-style literals (dynamic/conditional styles stay inline).
const IL: Record<string, CSSProperties> = {
  statusHead: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  warnText: { color: 'var(--c-warning)', fontSize: 10 },
  corrBox: { padding: '3px 6px', marginTop: 2, borderRadius: 'var(--r-sm)', background: 'var(--c-warning-soft)', border: '1px solid var(--c-warning-soft)' },
  corrTitle: { fontSize: 9, color: 'var(--c-warning)', fontWeight: 'var(--weight-semi)', marginBottom: 2 },
  corrItem: { fontSize: 10, color: 'var(--c-text-dim)', lineHeight: '14px' },
  corrField: { color: 'var(--c-info)' },
  btnRow: { display: 'flex', gap: 4, marginTop: 4 },
};

interface DatasetStatusSectionProps {
  screenStatus: ReturnType<typeof useScreenDataStatus>;
  connStatus: ReturnType<typeof useConnectionStatus>;
  detectionResult: ReturnType<typeof useScreenDetection>;
  progressInfo: ReturnType<typeof wasmGetProgressIndicator>;
  incompleteConnCount: number;
  onEditScreen: () => void;
  onEditConnections: () => void;
}

const DatasetStatusSection = (props: DatasetStatusSectionProps) => {
  const { screenStatus, connStatus, detectionResult, progressInfo, incompleteConnCount, onEditScreen, onEditConnections } = props;

  return (
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
        <Button variant="tertiary" size="sm" onClick={onEditScreen}>
          ✏️ Edit Screen
        </Button>
        <Button variant="tertiary" size="sm" onClick={onEditConnections}>
          ✏️ Edit Connections
        </Button>
      </Box>
    </Box>
  );
};

export { DatasetStatusSection };
