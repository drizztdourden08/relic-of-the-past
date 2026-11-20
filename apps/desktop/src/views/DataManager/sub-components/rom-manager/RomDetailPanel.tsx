/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text, formatDate } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { AssetsRow } from './AssetsRow';
import { SupplementRow } from './SupplementRow';
import type { RomDetailPanelProps } from './RomDetailPanel.type';

const RomDetailPanel = (props: RomDetailPanelProps) => {
  const t = useT();
  const { selected, loadingDetail, detail, selectedBase, selectedSupplement, onExtractAssets } = props;

  if (!selected) return <Text>{t('data-manager:rom-manager.select-a-rom-to-view')}</Text>;
  if (loadingDetail) return <Text>{t('data-manager:rom-manager.loading')}</Text>;
  if (!detail) return <Text>{t('data-manager:rom-manager.rom-info-not-available')}</Text>;

  return (
    <Box>
      <Text as="h3" className="detail-panel__title">{detail.name}</Text>
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">{t('data-manager:rom-manager.detail.size')}</Text>
        <Text className="detail-panel__value">{formatBytes(detail.size)}</Text>

        <Text className="detail-panel__label">{t('data-manager:rom-manager.detail.hash')}</Text>
        <Text className="detail-panel__value" mono>{detail.hash}</Text>

        <Text className="detail-panel__label">{t('data-manager:rom-manager.detail.added')}</Text>
        <Text className="detail-panel__value">{formatDate(detail.created, 'date')}</Text>

        <Text className="detail-panel__label">{t('data-manager:rom-manager.detail.modified')}</Text>
        <Text className="detail-panel__value">{formatDate(detail.modified, 'date')}</Text>

        <Text className="detail-panel__label">{selectedSupplement ? t('data-manager:rom-manager.detail.attached') : t('data-manager:rom-manager.detail.assets')}</Text>
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
