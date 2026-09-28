/* @layer store-site @kind component */
/**
 * My publications: the scope tabs in the header with Publish at its end, the totals line
 * with the link to the public page, then the FilterBar and the table of every version and
 * listing edit grouped by item, with the picked row's review record in the side column
 * under any uploads in flight. Everything stateful lives in usePublicationsPage.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import plusIcon from '@iconify-icons/lucide/plus';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { DataTable } from '@ds/composites/DataTable';
import { FilterBar } from '@ds/composites/FilterBar';
import { SideColumn } from '@site-kit/layout/SideColumn/SideColumn';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
import { Workbench } from '@site-kit/layout/Workbench/Workbench';
import { SavedViewsMenu } from '@site-kit/views/SavedViewsMenu';
import { Link } from '@site-kit/router/Link';
import { useSessionContext } from '@site-kit/session/session-context';
import { authorPath } from '../../catalog/item-paths';
import { publicationRowId } from '../../publications/publication-row';
import { PUBLICATION_DEFAULT_COLUMNS, PUBLICATION_DEFAULT_GROUP_BY } from '../../publications/publication-schema';
import { usePublicationsPage } from './behavior/usePublicationsPage';
import { PublicationDetail } from './sub-components/PublicationDetail';
import './Publications.css';

type PublicationsProps = {
  /** From the `/publications/:rowId` route; picks that row. */
  selectedId?: string;
};

const COUNT_LABEL = ['entry', 'entries'] as const;

const PUBLISH = (
  <Link to="/publications/new" className="btn btn--primary btn--sm publications__publish">
    <IconifyIcon icon={plusIcon} aria-hidden="true" /> Publish
  </Link>
);

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
    <SitePage section="publications" tabs={page.tabs} scroll={false} actions={PUBLISH} aside={aside}>
      <Stack gap="md" align="stretch" className="publications">
        <Flex align="baseline" gap="sm" wrap>
          <Text as="span" variant="caption" className="publications__totals">{page.totals}</Text>
          {me && <Link to={authorPath(me.id)} className="publications__public">View my public page {'›'}</Link>}
        </Flex>
        {publications.error && <Text as="p" variant="caption" role="alert">{publications.error}</Text>}
        <Workbench toolbar={toolbar} table={table} detail={null} />
      </Stack>
    </SitePage>
  );
};

export { Publications };
export type { PublicationsProps };
