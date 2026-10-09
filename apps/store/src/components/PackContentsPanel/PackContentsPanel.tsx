/* @layer store-site @kind component */
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { PackContents } from '@domains/packs/views/PackContents';
import type { PackContentsPanelProps } from './PackContentsPanel.type';

const PackContentsPanel = (props: PackContentsPanelProps) => {
  const { kind, pack, noPack, note, className } = props;
  const problem = noPack ?? pack.error;
  return (
    <Stack gap="md" align="stretch" className={className}>
      {note && <Text as="p" variant="caption">{note}</Text>}
      {problem && <Text as="p" variant="caption" role={pack.error ? 'alert' : 'status'}>{problem}</Text>}
      {!problem && !pack.source && <Text as="p" variant="caption" role="status">Opening the pack...</Text>}
      {pack.source && <PackContents kind={kind} source={pack.source} />}
    </Stack>
  );
};

export { PackContentsPanel };
export type { PackContentsPanelProps } from './PackContentsPanel.type';
