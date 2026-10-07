/* @layer store-site @kind component */
/**
 * One item, laid out like the app's Home tab: the kind's section and the Overview, Contents,
 * Versions and Ratings tabs in the header, then the item's hero (its banner as the scene, the name,
 * Install and the staff buttons) over the tab's content. A reviewer also gets Unlist or
 * Relist and a Delete on each approved version; a curator gets Feature or Unfeature.
 * Everything stateful lives in useItemPage.
 */
import storeIcon from '@iconify-icons/lucide/store';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { ItemHero } from '../../components/ItemHero';
import { PackContentsPanel } from '../../components/PackContentsPanel/PackContentsPanel';
import { RatingPanel } from '../../components/RatingPanel/RatingPanel';
import { TitledPage } from '../../layout/TitledPage/TitledPage';
import { liveVersionOf } from '../../catalog/approved-versions';
import { KIND_ICONS, KIND_PLURALS } from '../../lib/kinds';
import { useItemPage } from './behavior/useItemPage';
import { ItemActions } from './sub-components/ItemActions';
import { ItemOverview } from './sub-components/ItemOverview';
import { ItemVersions } from './sub-components/ItemVersions';
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
  const actions = <ItemActions item={item} canModerate={page.canModerate} canFeature={page.canFeature} listing={listing} />;

  return (
    <TitledPage icon={KIND_ICONS[item.kind]} title={KIND_PLURALS[item.kind]} tabs={page.tabs}>
      <Stack gap="lg" align="stretch">
        <ItemHero item={item} version={liveVersionOf(item)} actions={actions} />
        <Stack gap="md" align="stretch" className="item">
          {listing.error && <Text as="p" variant="caption" role="alert">{listing.error}</Text>}
          {item.status === 'unlisted' && <Text as="p" variant="caption" role="status">This item is unlisted: players cannot find it in the catalogue.</Text>}
          {page.tab === 'overview' && <ItemOverview item={item} />}
          {page.tab === 'contents' && <PackContentsPanel kind={item.kind} pack={page.livePack.pack} noPack={page.livePack.noPack} />}
          {page.tab === 'versions' && (
            <ItemVersions item={item} versions={page.versions} canModerate={page.canModerate} onItem={page.onItem} />
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
      </Stack>
    </TitledPage>
  );
};

export { Item };
export type { ItemProps };
