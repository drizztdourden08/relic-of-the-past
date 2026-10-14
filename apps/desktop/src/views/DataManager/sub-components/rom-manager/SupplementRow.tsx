/* @layer renderer-components @kind component */
import { Text, Icon } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { SupplementRowProps } from './RomDetailPanel.type';

const SupplementRow = ({ supplement }: SupplementRowProps) => (
  supplement.attachedTo.length > 0
    ? <Text tone="secondary"><Icon name="check" inline /> Attached to {supplement.attachedTo.join(', ')}{supplement.bytes ? ` (${formatBytes(supplement.bytes)})` : ''}</Text>
    : <Text tone="primary">Not attached to any base cartridge yet</Text>
);

export { SupplementRow };
