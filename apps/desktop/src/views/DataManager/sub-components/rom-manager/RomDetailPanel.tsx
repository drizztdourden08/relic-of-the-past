/* @layer renderer-components @kind component */
import { Box, Text, formatDate } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { AssetsRow } from './AssetsRow';
import { SupplementRow } from './SupplementRow';
import type { RomDetailPanelProps } from './RomDetailPanel.type';

const RomDetailPanel = (props: RomDetailPanelProps) => {
  const { selected, loadingDetail, detail, selectedBase, selectedSupplement, onExtractAssets } = props;

  if (!selected) return <Text>Select a ROM to view details</Text>;
  if (loadingDetail) return <Text>Loading...</Text>;
  if (!detail) return <Text>ROM info not available</Text>;

  return (
    <Box>
      <Text as="h3" className="detail-panel__title">{detail.name}</Text>
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">Size</Text>
        <Text className="detail-panel__value">{formatBytes(detail.size)}</Text>

        <Text className="detail-panel__label">Hash</Text>
        <Text className="detail-panel__value" mono>{detail.hash}</Text>

        <Text className="detail-panel__label">Added</Text>
        <Text className="detail-panel__value">{formatDate(detail.created, 'date')}</Text>

        <Text className="detail-panel__label">Modified</Text>
        <Text className="detail-panel__value">{formatDate(detail.modified, 'date')}</Text>

        <Text className="detail-panel__label">{selectedSupplement ? 'Attached' : 'Assets'}</Text>
        <Text className="detail-panel__value">
          {selectedSupplement
            ? <SupplementRow supplement={selectedSupplement} />
            : selectedBase && <AssetsRow base={selectedBase} onExtractAssets={onExtractAssets} />}
        </Text>
      </Box>
    </Box>
  );
};

export { RomDetailPanel };
