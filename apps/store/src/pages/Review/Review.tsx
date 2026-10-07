/* @layer store-site @kind component */
/**
 * The Reviewer Hub: the Versions, Listing edits and Not submitted tabs in the header, the
 * counts, then the kit's workbench (FilterBar, saved views and the table, oldest first).
 * A row opens its review page. Not submitted lists ready versions the author has not sent
 * yet; they are outside the queue. Everything stateful lives in useReviewPage.
 */
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { DataTable } from '@ds/composites/DataTable';
import { FilterBar } from '@ds/composites/FilterBar';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
import { Workbench } from '@site-kit/layout/Workbench/Workbench';
import { SavedViewsMenu } from '@site-kit/views/SavedViewsMenu';
import { reviewRowId } from '../../review/review-row';
import { REVIEW_DEFAULT_COLUMNS } from '../../review/review-schema';
import { useReviewPage } from './behavior/useReviewPage';
import type { ReviewScope } from './behavior/useReviewPage';
import './Review.css';

const COUNT_LABEL = ['entry', 'entries'] as const;

const EMPTY: Record<ReviewScope, string> = {
  versions: 'Nothing is waiting. Well done.',
  listings: 'Nothing is waiting. Well done.',
  unsubmitted: 'Every uploaded version has been sent for review.',
};

const UNSUBMITTED_NOTE = 'Not in the approval queue: the author has not asked for review yet. Dates are upload dates.';

const Review = () => {
  const page = useReviewPage();
  const { view } = page;

  const toolbar = (
    <>
      <FilterBar
        schema={page.schema}
        clauses={view.clauses}
        onChange={view.setClauses}
        search={view.search}
        onSearchChange={view.setSearch}
        searchPlaceholder="Search the queue..."
        searchLabel="Search the review queue"
      />
      <SavedViewsMenu state={view.savedViews} />
    </>
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
    <SitePage section="review" tabs={page.tabs} scroll={false}>
      <Stack gap="md" align="stretch" className="review">
        <Text as="span" variant="caption" className="review__summary">{page.counts}</Text>
        {page.scopeId === 'unsubmitted' && <Text as="p" variant="caption">{UNSUBMITTED_NOTE}</Text>}
        {page.error && <Text as="p" variant="caption" role="alert">{page.error}</Text>}
        <Workbench toolbar={toolbar} table={table} detail={null} />
      </Stack>
    </SitePage>
  );
};

export { Review };
