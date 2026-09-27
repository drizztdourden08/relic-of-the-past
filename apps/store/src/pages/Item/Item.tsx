/* @layer store-site @kind component */
/**
 * One item: its kind's icon and its name in the header with the Overview, Versions and
 * Ratings tabs and Install at the end, then the tab's content. A reviewer also gets Unlist
 * or Relist. Everything stateful lives in useItemPage.
 */
import storeIcon from '@iconify-icons/lucide/store';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { KIND_CONTAINER } from '@shared/store/containers';
import { InstallButton } from '../../components/InstallButton/InstallButton';
import { RatingPanel } from '../../components/RatingPanel/RatingPanel';
import { VersionHistory } from '../../components/VersionHistory/VersionHistory';
import { TitledPage } from '../../layout/TitledPage/TitledPage';
import { KIND_ICONS } from '../../lib/kinds';
import { useItemPage } from './behavior/useItemPage';
import { ItemOverview } from './sub-components/ItemOverview';
import './Item.css';

type ItemProps = { id: string };

const Item = (props: ItemProps) => {
  const { id } = props;
  const page = useItemPage(id);
  const { data, rating, listing } = page;

  if (!data) {
    return (
      <TitledPage icon={storeIcon} title="Item">
        <Text as="p" variant="caption" role={page.error ? 'alert' : 'status'}>{page.error ?? 'Loading the item...'}</Text>
      </TitledPage>
    );
  }

  const { item } = data;
  const actions = (
    <Flex align="center" gap="sm" wrap className="item__actions">
      <InstallButton itemId={item.id} container={item.liveVersion === null ? null : KIND_CONTAINER[item.kind]} />
      {page.canModerate && item.status === 'published' && (
        <Button variant="danger" size="sm" disabled={listing.busy} onClick={() => void listing.unlist(item.id)}>Unlist</Button>
      )}
      {page.canModerate && item.status === 'unlisted' && (
        <Button variant="secondary" size="sm" disabled={listing.busy} onClick={() => void listing.relist(item.id)}>Relist</Button>
      )}
    </Flex>
  );

  return (
    <TitledPage icon={KIND_ICONS[item.kind]} title={item.name} tabs={page.tabs} actions={actions}>
      <Stack gap="md" align="stretch" className="item">
        {listing.error && <Text as="p" variant="caption" role="alert">{listing.error}</Text>}
        {item.status === 'unlisted' && <Text as="p" variant="caption" role="status">This item is unlisted: players cannot find it in the catalogue.</Text>}
        {page.tab === 'overview' && <ItemOverview item={item} />}
        {page.tab === 'versions' && (
          <Stack gap="sm" align="stretch">
            <VersionHistory versions={page.versions} liveVersion={item.liveVersion} />
            <Text as="p" variant="caption">Every version here was approved by a reviewer before players could install it.</Text>
          </Stack>
        )}
        {page.tab === 'ratings' && (
          <RatingPanel
            stats={item.stats}
            myRating={data.myRating}
            blockedReason={rating.blockedReason}
            note={page.installedNote}
            busy={rating.busy}
            error={rating.error}
            onRate={rating.rate}
            onClear={rating.clear}
          />
        )}
      </Stack>
    </TitledPage>
  );
};

export { Item };
export type { ItemProps };
