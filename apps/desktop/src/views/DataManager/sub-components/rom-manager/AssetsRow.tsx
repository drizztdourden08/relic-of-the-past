/* @layer renderer-components @kind component */
import { Text, Button, Icon } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { AssetsRowProps } from './RomDetailPanel.type';

const AssetsRow = ({ base, onExtractAssets }: AssetsRowProps) => {
  if (base.extractionStatus === 'ready') {
    return <Text tone="secondary"><Icon name="check" inline /> Extracted{base.assetSize ? ` (${formatBytes(base.assetSize)})` : ''}</Text>;
  }
  if (base.extractionStatus === 'extracting') return <Text tone="primary"><Icon name="refresh-cw" inline /> Extracting...</Text>;
  return (
    <Button variant="primary" size="sm" onClick={() => { void onExtractAssets(base.romFile); }}>
      Extract Assets
    </Button>
  );
};

export { AssetsRow };
