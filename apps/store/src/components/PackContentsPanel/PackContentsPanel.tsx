/* @layer store-site @kind component */
/**
 * A Contents tab: what is inside a pack, drawn by the app's own viewers for its kind (the
 * track list, the sprite sheet, the dialogue), read in parts from the bucket. The review
 * page and the item page both show it.
 */
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { PackContents } from '@domains/packs/views/PackContents';
import type { StoreKind } from '@shared/store/types';
import type { PackLink } from '../../lib/pack-link/usePackLink';

type PackContentsPanelProps = {
  kind: StoreKind;
  pack: PackLink;
  /** Why there is no pack to read, when there is none. */
  noPack: string | null;
  /** A line over the contents, when they need one. */
  note?: string | null;
  className?: string;
};

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
export type { PackContentsPanelProps };
