/* @layer store-site @kind component */
import { Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { SideColumn, SitePage, Workbench, SavedViewsMenu, AppLink, useSessionContext } from '@rotp/design';
import { authorPath } from '../../catalog/item-paths';
import { publicationRowId } from '../../publications/publication-row';
import { PUBLICATION_DEFAULT_COLUMNS, PUBLICATION_DEFAULT_GROUP_BY } from '../../publications/publication-schema';
import { usePublicationsPage } from './behavior/usePublicationsPage';
import { PublicationDetail } from './sub-components/PublicationDetail';
import { PublishAction } from './sub-components/PublishAction';
import { COUNT_LABEL } from './Publications.constants';
import type { PublicationsProps } from './Publications.type';
import './Publications.css';

const Publications = (props: PublicationsProps) => {
  const { selectedId = null } = props;
  const { me } = useSessionContext();
  const page = usePublicationsPage(selectedId);
  const { publications, view, picked } = page;

  const toolbar = (
    <>
      <FilterBar
        schema={page.schema}
        clauses={view.clauses}
        onChange={view.setClauses}
        search={view.search}
        onSearchChange={view.setSearch}
        searchPlaceholder="Search your items and versions..."
        searchLabel="Search publications"
      />
      <SavedViewsMenu state={view.savedViews} />
    </>
  );

  const table = (
    <DataTable
      rows={page.shown}
      schema={page.schema}
      getRowId={publicationRowId}
      viewKey={view.tableKey}
      viewStorage={view.storage}
      fallbackColumns={PUBLICATION_DEFAULT_COLUMNS}
      fallbackGroupBy={PUBLICATION_DEFAULT_GROUP_BY}
      selectedId={selectedId}
      onSelect={page.select}
      countLabel={COUNT_LABEL}
      emptyMessage={publications.loading ? 'Loading your publications...' : 'Nothing published yet. Publish your first pack.'}
    />
  );

  const aside = picked && (
    <SideColumn>
      <PublicationDetail key={selectedId} item={picked.item} target={picked.target} actions={page.actions} onClose={page.deselect} />
    </SideColumn>
  );

  return (
    <SitePage section="publications" tabs={page.tabs} scroll={false} actions={<PublishAction />} aside={aside}>
      <Stack gap="md" align="stretch" className="publications">
        <Flex align="baseline" gap="sm" wrap>
          <Text as="span" variant="caption" className="publications__totals">{page.totals}</Text>
          {me && <AppLink to={authorPath(me.id)} className="publications__public">View my public page {'›'}</AppLink>}
        </Flex>
        {publications.error && <Text as="p" variant="caption" role="alert">{publications.error}</Text>}
        <Workbench toolbar={toolbar} table={table} detail={null} />
      </Stack>
    </SitePage>
  );
};

export { Publications };
export type { PublicationsProps } from './Publications.type';
