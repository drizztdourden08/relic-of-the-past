/* @layer store-site @kind component */
import { Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar, SettingsPage } from '@drizztdourden08/tessera/composites';
import { SavedViewsMenu, AppLink, useSectionHeading, useSessionContext } from '@rotp/design';
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
  const heading = useSectionHeading('publications');
  const { publications, view, picked } = page;

  return (
    <Flex gap="md" align="stretch" className="publications">
      <SettingsPage icon={heading.icon} title={heading.title} tabs={page.tabs} scroll={false} actions={<PublishAction />} className="publications__page">
        <Stack gap="md" align="stretch" className="publications__body">
          <Flex align="baseline" gap="sm" wrap>
            <Text as="span" variant="caption" className="publications__totals">{page.totals}</Text>
            {me && <AppLink to={authorPath(me.id)} className="publications__public">View my public page {'›'}</AppLink>}
          </Flex>
          {publications.error && <Text as="p" variant="caption" role="alert">{publications.error}</Text>}
          <FilterBar
            schema={page.schema}
            clauses={view.clauses}
            onChange={view.setClauses}
            search={view.search}
            onSearchChange={view.setSearch}
            searchPlaceholder="Search your items and versions..."
            searchLabel="Search publications"
            extra={<SavedViewsMenu state={view.savedViews} />}
          />
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
        </Stack>
      </SettingsPage>
      {picked && (
        <Stack as="aside" align="stretch" className="publications__aside">
          <PublicationDetail key={selectedId} item={picked.item} target={picked.target} actions={page.actions} onClose={page.deselect} />
        </Stack>
      )}
    </Flex>
  );
};

export { Publications };
export type { PublicationsProps } from './Publications.type';
