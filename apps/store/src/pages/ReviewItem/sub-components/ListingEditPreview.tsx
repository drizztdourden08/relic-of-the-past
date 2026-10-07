/* @layer store-site @kind component */
/** What a listing edit would change: each field it sets, with the new text or picture beside the current one. */
import { Stack } from '@ds/primitives/Stack';
import { StatRow } from '@ds/primitives/StatRow';
import { Text } from '@ds/primitives/Text';
import type { ListingEdit, StoreItem } from '@shared/store/types';
import { TagList } from '@site-kit/components/TagList/TagList';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';

type ListingEditPreviewProps = {
  item: StoreItem;
  edit: ListingEdit;
};

const ListingEditPreview = (props: ListingEditPreviewProps) => {
  const { item, edit } = props;
  const { patch } = edit;
  return (
    <Stack gap="sm" align="stretch">
      <Text as="span" variant="label">Changes to the listing</Text>
      {patch.name !== undefined && <StatRow label="name" value={`${item.name} → ${patch.name}`} />}
      {patch.summary !== undefined && <StatRow label="one line" value={patch.summary} />}
      {patch.license !== undefined && <StatRow label="licence" value={`${item.license} → ${patch.license}`} />}
      {patch.tags !== undefined && <StatRow label="tags" value={<TagList tags={patch.tags} />} />}
      {patch.color !== undefined && <StatRow label="colour" value={`${item.color} → ${patch.color}`} mono />}
      {patch.description !== undefined && <Text as="p" className="review-item__text">{patch.description || 'Description removed.'}</Text>}
      {patch.card !== undefined && (
        <Stack gap="xs" align="stretch">
          <Text as="span" variant="caption">New card</Text>
          <ItemPicture picture={patch.card} kind={item.kind} color={patch.color ?? item.color} />
        </Stack>
      )}
      {patch.banner !== undefined && (
        <Stack gap="xs" align="stretch">
          <Text as="span" variant="caption">{patch.banner ? 'New banner' : 'Banner removed'}</Text>
          {patch.banner && <ItemPicture picture={patch.banner} kind={item.kind} role="banner" color={patch.color ?? item.color} />}
        </Stack>
      )}
    </Stack>
  );
};

export { ListingEditPreview };
export type { ListingEditPreviewProps };
