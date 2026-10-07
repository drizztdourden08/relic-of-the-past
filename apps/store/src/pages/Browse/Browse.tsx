/* @layer store-site @kind component */
/**
 * Browse, and each kind's page: the kind tabs with their counts in the header, then the
 * count line, the FilterBar with the sort and the saved views, and the card grid, with the
 * picked item in the side column. Everything stateful lives in useBrowsePage.
 */
import { Flex } from '@ds/primitives/Flex';
import { Select } from '@ds/primitives/Select';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { FilterBar } from '@ds/composites/FilterBar';
import type { StoreKind } from '@shared/store/types';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
import { SideColumn } from '@site-kit/layout/SideColumn/SideColumn';
import { SavedViewsMenu } from '@site-kit/views/SavedViewsMenu';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import { KIND_SECTIONS } from '../../lib/kinds';
import { plural } from '../../lib/format-count';
import { useBrowsePage } from './behavior/useBrowsePage';
import { ItemSideCard } from './sub-components/ItemSideCard';
import './Browse.css';

type BrowseProps = {
  /** The kind the route narrows to; null is every kind. */
  kind: StoreKind | null;
  /** From the `/browse/:id` or `/<kind>/:id` route; picks that item. */
  selectedId?: string;
};

const SEARCH_PLACEHOLDER = 'Search items...';

const Browse = (props: BrowseProps) => {
  const { kind, selectedId = null } = props;
  const page = useBrowsePage(kind, selectedId);
  const { catalog, view, sort, selected } = page;

  const aside = selected && (
    <SideColumn>
      <ItemSideCard key={selected.id} item={selected} detail={page.detail} onClose={page.deselect} />
    </SideColumn>
  );

  return (
    <SitePage section={kind ? KIND_SECTIONS[kind] : 'browse'} tabs={page.tabs} scroll={false} aside={aside}>
      <Stack gap="md" align="stretch" className="browse">
        <Text as="span" variant="caption" className="browse__summary">{plural(page.shown.length, 'item', 'items')}</Text>
        {catalog.error && <Text as="p" variant="caption" role="alert">{catalog.error}</Text>}
        <Flex align="start" gap="sm" className="browse__toolbar">
          <FilterBar
            schema={page.schema}
            clauses={view.clauses}
            onChange={view.setClauses}
            search={view.search}
            onSearchChange={view.setSearch}
            searchPlaceholder={SEARCH_PLACEHOLDER}
            searchLabel="Search items"
          />
          <Select value={sort.sortId} onChange={sort.setSortId} options={sort.options} size="sm" className="browse__sort" />
          <SavedViewsMenu state={view.savedViews} />
        </Flex>
        <ItemGrid
          items={page.shown}
          itemPath={page.itemPathIn}
          selectedId={selectedId}
          emptyMessage={catalog.loading ? 'Loading the Hookshop...' : 'No item matches.'}
        />
      </Stack>
    </SitePage>
  );
};

export { Browse };
export type { BrowseProps };
