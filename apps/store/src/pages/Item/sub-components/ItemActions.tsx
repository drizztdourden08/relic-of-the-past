/* @layer store-site @kind component */
import { Button, Flex } from '@drizztdourden08/tessera/primitives';
import { KIND_CONTAINER } from '@rotp/hub-contracts';
import { InstallButton } from '../../../components/InstallButton/InstallButton';
import { FeatureButton } from './FeatureButton';
import type { ItemActionsProps } from './ItemActions.type';

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
