/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text, Icon } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { SupplementRowProps } from './RomDetailPanel.type';

const SupplementRow = ({ supplement }: SupplementRowProps) => {
  const t = useT();
  return (
  supplement.attachedTo.length > 0
    ? <Text tone="secondary"><Icon name="check" inline /> {t('data-manager:rom-manager.attached-to', { bases: supplement.attachedTo.join(', ') })}{supplement.bytes ? ` (${formatBytes(supplement.bytes)})` : ''}</Text>
    : <Text tone="primary">{t('data-manager:rom-manager.not-attached-to-any-base')}</Text>
  );
};

export { SupplementRow };
