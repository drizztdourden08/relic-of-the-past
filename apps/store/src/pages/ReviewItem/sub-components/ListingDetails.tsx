/* @layer store-site @kind component */
import { SettingsSection } from '@ds/composites/SettingsSection';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { StatRow } from '@ds/primitives/StatRow';
import { Text } from '@ds/primitives/Text';
import type { MediaRef } from '@shared/store/types';
import { TagList } from '@site-kit/components/TagList/TagList';
import { itemColorStyle } from '../../../lib/item-color-style';
import type { ListingDetailsProps } from './ListingDetails.type';

const pictureSize = (picture: MediaRef | null): string =>
  (picture ? `${picture.width} × ${picture.height}` : 'none');

const ListingDetails = (props: ListingDetailsProps) => {
  const { item } = props;
  const colour = (
    <Flex align="center" gap="xs">
      <Box as="span" className="review-item__swatch" style={itemColorStyle(item.color)} aria-hidden="true" />
      {item.color || '-'}
    </Flex>
  );
  return (
    <SettingsSection title="Listing">
      <StatRow label="name" value={item.name} />
      <StatRow label="slug" value={item.slug} mono />
      <StatRow label="one line" value={item.summary || '-'} />
      <StatRow label="licence" value={item.license || '-'} />
      <StatRow label="tags" value={item.tags.length > 0 ? <TagList tags={item.tags} /> : '-'} />
      <StatRow label="colour" value={colour} mono />
      <StatRow label="card" value={pictureSize(item.card)} mono />
      <StatRow label="banner" value={pictureSize(item.banner)} mono />
      <StatRow label="status" value={item.status} />
      <Text as="span" variant="caption">Description</Text>
      <Text as="p" className="review-item__text">{item.description.trim() || 'No description.'}</Text>
    </SettingsSection>
  );
};

export { ListingDetails };
