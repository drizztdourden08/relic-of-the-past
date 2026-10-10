/* @layer store-site @kind component */
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ListingPictureChanges } from './ListingPictureChanges';
import { ListingTextChanges } from './ListingTextChanges';
import type { ListingEditPreviewProps } from './ListingEditPreview.type';

const ListingEditPreview = (props: ListingEditPreviewProps) => {
  const { item, edit } = props;
  return (
    <Stack gap="sm" align="stretch">
      <Text as="span" variant="label">Changes to the listing</Text>
      <ListingTextChanges item={item} edit={edit} />
      <ListingPictureChanges item={item} edit={edit} />
    </Stack>
  );
};

export { ListingEditPreview };
