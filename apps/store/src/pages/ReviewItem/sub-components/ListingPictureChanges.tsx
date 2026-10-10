/* @layer store-site @kind component */
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';
import type { ListingEditPreviewProps } from './ListingEditPreview.type';

const ListingPictureChanges = (props: ListingEditPreviewProps) => {
  const { item, edit } = props;
  const { patch } = edit;
  return (
    <>
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
    </>
  );
};

export { ListingPictureChanges };
