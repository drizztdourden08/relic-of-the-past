/* @layer renderer-components @kind component */
/**
 * Detail panel for the selected ROM. A base cartridge keeps its extract-assets
 * affordance; a supplement has none — it only shows which bases currently carry
 * its sidecar, since there is nothing to extract from a supplement on its own.
 */
import type { CSSProperties } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Button } from '@ds/primitives/Button';
import type { SupplementStatus } from '@shared/storage/roms';
import { formatBytes } from '@app/utils/formatBytes';
import type { RomDetail } from './types';

const IL: Record<string, CSSProperties> = {
  mono: { fontFamily: 'var(--font-mono)' },
  green: { color: 'var(--c-green)' },
  gold: { color: 'var(--c-gold)' },
};

interface RomDetailPanelProps {
  selected: string | null;
  loadingDetail: boolean;
  detail: RomDetail | null;
  selectedBase: RomDisplayInfo | undefined;
  selectedSupplement: SupplementStatus | undefined;
  onExtractAssets: (romFile: string) => void;
}

const AssetsRow = ({ base, onExtractAssets }: { base: RomDisplayInfo; onExtractAssets: (romFile: string) => void }) => {
  if (base.extractionStatus === 'ready') {
    return <Text style={IL.green}>✓ Extracted{base.assetSize ? ` (${formatBytes(base.assetSize)})` : ''}</Text>;
  }
  if (base.extractionStatus === 'extracting') return <Text style={IL.gold}>⟳ Extracting…</Text>;
  return (
    <Button variant="primary" size="sm" onClick={() => onExtractAssets(base.romFile)}>
      Extract Assets
    </Button>
  );
};

const SupplementRow = ({ supplement }: { supplement: SupplementStatus }) => (
  supplement.attachedTo.length > 0
    ? <Text style={IL.green}>✓ Attached to {supplement.attachedTo.join(', ')}{supplement.bytes ? ` (${formatBytes(supplement.bytes)})` : ''}</Text>
    : <Text style={IL.gold}>Not attached to any base cartridge yet</Text>
);

const RomDetailPanel = (props: RomDetailPanelProps) => {
  const { selected, loadingDetail, detail, selectedBase, selectedSupplement, onExtractAssets } = props;

  if (!selected) return <Text>Select a ROM to view details</Text>;
  if (loadingDetail) return <Text>Loading…</Text>;
  if (!detail) return <Text>ROM info not available</Text>;

  return (
    <Box>
      <Text as="h3" className="detail-panel__title">{detail.name}</Text>
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">Size</Text>
        <Text className="detail-panel__value">{formatBytes(detail.size)}</Text>

        <Text className="detail-panel__label">Hash</Text>
        <Text className="detail-panel__value" style={IL.mono}>{detail.hash}</Text>

        <Text className="detail-panel__label">Added</Text>
        <Text className="detail-panel__value">{new Date(detail.created).toLocaleDateString()}</Text>

        <Text className="detail-panel__label">Modified</Text>
        <Text className="detail-panel__value">{new Date(detail.modified).toLocaleDateString()}</Text>

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
export type { RomDetailPanelProps };
