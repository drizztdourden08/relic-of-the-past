/* @layer store-site @kind component */
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar, SettingsPage } from '@drizztdourden08/tessera/composites';
import { SavedViewsMenu, useSectionHeading } from '@rotp/design';
import { reviewRowId } from '../../review/review-row';
import { REVIEW_DEFAULT_COLUMNS } from '../../review/review-schema';
import { useReviewPage } from './behavior/useReviewPage';
import { COUNT_LABEL, EMPTY, UNSUBMITTED_NOTE } from './Review.constants';
import './Review.css';

const Review = () => {
  const page = useReviewPage();
  const heading = useSectionHeading('review');
  const { view } = page;

  const toolbar = (
    <FilterBar
      schema={page.schema}
      clauses={view.clauses}
      onChange={view.setClauses}
      search={view.search}
      onSearchChange={view.setSearch}
      searchPlaceholder="Search the queue..."
      searchLabel="Search the review queue"
      extra={<SavedViewsMenu state={view.savedViews} />}
    />
  );

  const table = (
    <DataTable
      rows={page.shown}
      schema={page.schema}
      getRowId={reviewRowId}
      viewKey={view.tableKey}
      viewStorage={view.storage}
      fallbackColumns={REVIEW_DEFAULT_COLUMNS}
      selectedId={null}
      onSelect={page.open}
      countLabel={COUNT_LABEL}
      emptyMessage={page.loading ? 'Loading the queue...' : EMPTY[page.scopeId]}
    />
  );

  return (
    <SettingsPage icon={heading.icon} title={heading.title} tabs={page.tabs} scroll={false}>
      <Stack gap="md" align="stretch" className="review">
        <Text as="span" variant="caption" className="review__summary">{page.counts}</Text>
        {page.scopeId === 'unsubmitted' && <Text as="p" variant="caption">{UNSUBMITTED_NOTE}</Text>}
        {page.error && <Text as="p" variant="caption" role="alert">{page.error}</Text>}
        {toolbar}
        {table}
      </Stack>
    </SettingsPage>
  );
};

export { Review };
