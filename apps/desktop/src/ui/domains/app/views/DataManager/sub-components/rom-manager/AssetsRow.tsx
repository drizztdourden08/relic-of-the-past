/* @layer renderer-components @kind component */
import { Text, Button } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@app/utils/formatBytes';
import { IL } from './RomDetailPanel.constants';
import type { AssetsRowProps } from './RomDetailPanel.type';

const AssetsRow = ({ base, onExtractAssets }: AssetsRowProps) => {
  if (base.extractionStatus === 'ready') {
    return <Text style={IL.green}>✓ Extracted{base.assetSize ? ` (${formatBytes(base.assetSize)})` : ''}</Text>;
  }
  if (base.extractionStatus === 'extracting') return <Text style={IL.gold}>⟳ Extracting...</Text>;
  return (
    <Button variant="primary" size="sm" onClick={() => onExtractAssets(base.romFile)}>
      Extract Assets
    </Button>
  );
};

export { AssetsRow };
