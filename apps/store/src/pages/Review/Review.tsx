/* @layer store-site @kind component */
/**
 * The review queue: the Versions and Listing edits tabs in the header, the counts, then the
 * kit's workbench (FilterBar, saved views and the table, oldest first) with the picked
 * entry's detail on its right. Everything stateful lives in useReviewPage.
 */
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { DataTable } from '@ds/composites/DataTable';
import { FilterBar } from '@ds/composites/FilterBar';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
import { Workbench } from '@site-kit/layout/Workbench/Workbench';
import { SavedViewsMenu } from '@site-kit/views/SavedViewsMenu';
import { entryId, reviewRowId } from '../../review/review-row';
import { REVIEW_DEFAULT_COLUMNS } from '../../review/review-schema';
import { useReviewPage } from './behavior/useReviewPage';
import { ReviewDetail } from './sub-components/ReviewDetail';
import './Review.css';

type ReviewProps = {
  /** From the `/review/:rowId` route; picks that entry. */
  selectedId?: string;
};

const COUNT_LABEL = ['entry', 'entries'] as const;

const Review = (props: ReviewProps) => {
  const { selectedId = null } = props;
  const page = useReviewPage(selectedId);
  const { queue, view, selected, actions } = page;

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
      selectedId={selectedId}
      onSelect={page.select}
      countLabel={COUNT_LABEL}
      emptyMessage={queue.loading ? 'Loading the queue...' : 'Nothing is waiting. Well done.'}
    />
  );

  const detail = selected && <ReviewDetail key={entryId(selected)} entry={selected} actions={actions} onClose={page.deselect} />;

  return (
    <SitePage section="review" tabs={page.tabs} scroll={false}>
      <Stack gap="md" align="stretch" className="review">
        <Text as="span" variant="caption" className="review__summary">{page.counts}</Text>
        {queue.error && <Text as="p" variant="caption" role="alert">{queue.error}</Text>}
        {!selected && actions.notice && <Text as="p" variant="caption" role="status">{actions.notice}</Text>}
        <Workbench toolbar={toolbar} table={table} detail={detail} />
      </Stack>
    </SitePage>
  );
};

export { Review };
export type { ReviewProps };
