/* @layer store-site @kind component */
/**
 * The Contents tab: what is inside the pack, drawn by the app's own viewers for its kind
 * (the track list, the sprite sheet, the dialogue), read in parts from the bucket.
 */
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { PackContents } from '@domains/packs/views/PackContents';
import type { StoreKind } from '@shared/store/types';
import type { PackLink } from '../behavior/usePackLink';
import type { PackTarget } from '../behavior/pack-target';

type ContentsPanelProps = {
  kind: StoreKind;
  pack: PackLink;
  target: PackTarget;
};

const ContentsPanel = (props: ContentsPanelProps) => {
  const { kind, pack, target } = props;
  const problem = target.noPack ?? pack.error;
  return (
    <Stack gap="md" align="stretch" className="review-item__contents">
      {target.note && <Text as="p" variant="caption">{target.note}</Text>}
      {problem && <Text as="p" variant="caption" role={pack.error ? 'alert' : 'status'}>{problem}</Text>}
      {!problem && !pack.source && <Text as="p" variant="caption" role="status">Opening the pack...</Text>}
      {pack.source && <PackContents kind={kind} source={pack.source} />}
    </Stack>
  );
};

export { ContentsPanel };
export type { ContentsPanelProps };
