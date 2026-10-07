/* @layer store-site @kind component */
/**
 * The buttons under an item's name: Install and Download for everyone, then what staff may
 * do. A curator (the feature right) features a published item on the home page or takes it
 * off; a reviewer unlists a published item or relists an unlisted one.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import starIcon from '@iconify-icons/lucide/star';
import starOffIcon from '@iconify-icons/lucide/star-off';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { KIND_CONTAINER } from '@shared/store/containers';
import type { StoreItem } from '@shared/store/types';
import { InstallButton } from '../../../components/InstallButton/InstallButton';
import type { useListingToggle } from '../../../catalog/useListingToggle';

type ItemActionsProps = {
  item: StoreItem;
  canModerate: boolean;
  canFeature: boolean;
  listing: ReturnType<typeof useListingToggle>;
};

const NOT_PUBLISHED = 'Only a published item can be featured.';

const FeatureButton = (props: Pick<ItemActionsProps, 'item' | 'listing'>) => {
  const { item, listing } = props;
  if (item.featured) {
    return (
      <Button variant="secondary" size="sm" icon={<IconifyIcon icon={starOffIcon} />} busy={listing.busy} onClick={() => void listing.unfeature(item.id)}>
        Remove from featured
      </Button>
    );
  }
  const published = item.status === 'published';
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<IconifyIcon icon={starIcon} />}
      disabled={!published}
      busy={listing.busy}
      title={published ? 'Add it to the featured row on the home page' : NOT_PUBLISHED}
      onClick={() => void listing.feature(item.id)}
    >
      Feature
    </Button>
  );
};

const ItemActions = (props: ItemActionsProps) => {
  const { item, canModerate, canFeature, listing } = props;
  return (
    <Flex align="center" gap="sm" wrap className="item__actions">
      <InstallButton itemId={item.id} container={item.liveVersion === null ? null : KIND_CONTAINER[item.kind]} />
      {canFeature && <FeatureButton item={item} listing={listing} />}
      {canModerate && item.status === 'published' && (
        <Button variant="danger" size="sm" disabled={listing.busy} onClick={() => void listing.unlist(item.id)}>Unlist</Button>
      )}
      {canModerate && item.status === 'unlisted' && (
        <Button variant="secondary" size="sm" disabled={listing.busy} onClick={() => void listing.relist(item.id)}>Relist</Button>
      )}
    </Flex>
  );
};

export { ItemActions };
export type { ItemActionsProps };
