/* @layer store-site @kind component */
import { Flex, Select, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { FilterBar, SettingsPage } from '@drizztdourden08/tessera/composites';
import { SavedViewsMenu, useSectionHeading } from '@rotp/design';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import { KIND_SECTIONS } from '../../lib/kinds';
import { plural } from '../../lib/format-count';
import { useBrowsePage } from './behavior/useBrowsePage';
import { ItemSideCard } from './sub-components/ItemSideCard';
import { SEARCH_PLACEHOLDER } from './Browse.constants';
import type { BrowseProps } from './Browse.type';
import './Browse.css';

const Browse = (props: BrowseProps) => {
  const { kind, selectedId = null } = props;
  const page = useBrowsePage(kind, selectedId);
  const heading = useSectionHeading(kind ? KIND_SECTIONS[kind] : 'browse');
  const { catalog, view, sort, selected } = page;

  const tools = (
    <Flex align="center" gap="sm">
      <Select value={sort.sortId} onChange={sort.setSortId} options={sort.options} size="sm" className="browse__sort" />
      <SavedViewsMenu state={view.savedViews} />
    </Flex>
  );

  return (
    <Flex gap="md" align="stretch" className="browse">
      <SettingsPage icon={heading.icon} title={heading.title} tabs={page.tabs} scroll={false} className="browse__page">
        <Stack gap="md" align="stretch" className="browse__body">
          <Text as="span" variant="caption" className="browse__summary">{plural(page.shown.length, 'item', 'items')}</Text>
          {catalog.error && <Text as="p" variant="caption" role="alert">{catalog.error}</Text>}
          <FilterBar
            schema={page.schema}
            clauses={view.clauses}
            onChange={view.setClauses}
            search={view.search}
            onSearchChange={view.setSearch}
            searchPlaceholder={SEARCH_PLACEHOLDER}
            searchLabel="Search items"
            extra={tools}
          />
          <ItemGrid
            items={page.shown}
            itemPath={page.itemPathIn}
            selectedId={selectedId}
            emptyMessage={catalog.loading ? 'Loading the Hookshop...' : 'No item matches.'}
          />
        </Stack>
      </SettingsPage>
      {selected && (
        <Stack as="aside" align="stretch" className="browse__aside">
          <ItemSideCard key={selected.id} item={selected} detail={page.detail} onClose={page.deselect} />
        </Stack>
      )}
    </Flex>
  );
};

export { Browse };
export type { BrowseProps } from './Browse.type';
