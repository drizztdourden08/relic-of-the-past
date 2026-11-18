/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text, Button, Icon } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { AssetsRowProps } from './RomDetailPanel.type';

const AssetsRow = ({ base, onExtractAssets }: AssetsRowProps) => {
  const t = useT();
  if (base.extractionStatus === 'ready') {
    return <Text tone="secondary"><Icon name="check" inline /> Extracted{base.assetSize ? ` (${formatBytes(base.assetSize)})` : ''}</Text>;
  }
  if (base.extractionStatus === 'extracting') return <Text tone="primary"><Icon name="refresh-cw" inline />{t('data-manager:rom-manager.extracting')}</Text>;
  return (
    <Button variant="primary" size="sm" onClick={() => { void onExtractAssets(base.romFile); }}>
      {t('data-manager:rom-manager.extract-assets')}
    </Button>
  );
};

export { AssetsRow };
