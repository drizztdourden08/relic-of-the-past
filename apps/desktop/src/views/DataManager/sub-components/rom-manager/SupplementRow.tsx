/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { IL } from './RomDetailPanel.constants';
import type { SupplementRowProps } from './RomDetailPanel.type';

const SupplementRow = ({ supplement }: SupplementRowProps) => (
  supplement.attachedTo.length > 0
    ? <Text style={IL.green}>✓ Attached to {supplement.attachedTo.join(', ')}{supplement.bytes ? ` (${formatBytes(supplement.bytes)})` : ''}</Text>
    : <Text style={IL.gold}>Not attached to any base cartridge yet</Text>
);

export { SupplementRow };
