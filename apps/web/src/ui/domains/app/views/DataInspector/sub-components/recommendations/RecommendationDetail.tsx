/* @layer renderer-app @kind component */
/**
 * The comparison view: what the dataset holds on the left, what the finding
 * proposes on the right, the same three tabs on both, scrolled together.
 *
 * Both panes read the RECOMMENDATION'S OWN collection, not the pseudo-collection
 * the list is showing — a finding about a connection is compared as a
 * connection, with that collection's schema, config and emitter — which is why
 * the source below is looked up by `entry.kind` rather than passed in.
 *
 * The difference between the two records is computed once, from the records
 * themselves, and then resolved to line numbers per side and per tab (see
 * comparison-lines.ts): the same field does not sit on the same line in two
 * different serialisations, let alone two different records.
 */
import { useCallback, useMemo } from 'react';
import { changedPaths } from '@shared/game/recommendations';
import { buildSchema } from '@ds/data';
import { Box } from '@ds/primitives';
import { COLLECTION_SOURCES } from '../../behavior/collection-sources';
import { highlightedLinesFor } from '../../behavior/recommendations/comparison-lines';
import { useComparisonScroll } from '../../behavior/recommendations/use-comparison-scroll';
import { useRecommendationReview } from '../../behavior/recommendations/useRecommendationReview';
import { certainOnly } from '../../behavior/recommendations/accept-all-certain';
import { ComparisonPane } from './ComparisonPane';
import { ProposalForm } from './ProposalForm';
import { RecommendationActions } from './RecommendationActions';
import { RecommendationSummary } from './RecommendationSummary';
import type { DetailTab } from '@ds/data';
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow } from '../../DataInspector.type';

const CURRENT = 'Current';
const PROPOSED = 'Proposed';
const NO_CURRENT = 'This record does not exist yet — the finding proposes adding it.';
const NO_PROPOSAL = 'This finding carries no proposal.';
const NOTHING_OPEN = 'Select a finding to compare it against the dataset.';

interface RecommendationDetailProps {
  entries: readonly Recommendation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

const RecommendationDetail = (props: RecommendationDetailProps) => {
  const { entries, selectedId, onSelect, tab, onTabChange } = props;

  const review = useRecommendationReview({ entries, selectedId, onSelect });
  const scroll = useComparisonScroll();
  const { selected, proposed, setProposed } = review;

  const source = COLLECTION_SOURCES[selected?.kind ?? 'screen'];
  const schema = useMemo(() => buildSchema(source.rows, source.config), [source]);

  const current = (selected?.current ?? undefined) as InspectorRow | undefined;
  const paths = useMemo(() => changedPaths(current ?? null, proposed), [current, proposed]);

  const commit = useCallback(
    (next: InspectorRow) => { setProposed(next); return Promise.resolve(); },
    [setProposed],
  );

  const certainCount = useMemo(() => certainOnly(review.order).length, [review.order]);

  if (!selected || !proposed) return <Box className="data-inspector__empty">{NOTHING_OPEN}</Box>;

  return (
    <Box className="rec-detail__body">
      <RecommendationSummary entry={selected} />
      <RecommendationActions
        certainCount={certainCount}
        isEdited={review.isEdited}
        busy={review.busy}
        error={review.error}
        onAccept={() => void review.accept()}
        onReject={() => void review.dismiss()}
        onRevert={review.revert}
        onAcceptAll={() => void review.acceptAll()}
      />
      <Box className="rec-detail__panes">
        <ComparisonPane
          title={CURRENT}
          source={source}
          schema={schema}
          record={current}
          emptyMessage={NO_CURRENT}
          tab={tab}
          onTabChange={onTabChange}
          highlightedLines={highlightedLinesFor(source, current, tab, paths)}
          editorSlot={current && (
            <ProposalForm
              kind={selected.kind}
              schema={schema}
              config={source.config}
              record={current}
              changedPaths={paths}
            />
          )}
          scroll={scroll.current}
        />
        <ComparisonPane
          title={PROPOSED}
          source={source}
          schema={schema}
          record={proposed}
          emptyMessage={NO_PROPOSAL}
          tab={tab}
          onTabChange={onTabChange}
          highlightedLines={highlightedLinesFor(source, proposed, tab, paths)}
          editorSlot={(
            <ProposalForm
              kind={selected.kind}
              schema={schema}
              config={source.config}
              record={proposed}
              changedPaths={paths}
              onCommit={commit}
            />
          )}
          scroll={scroll.proposed}
        />
      </Box>
    </Box>
  );
};

export { RecommendationDetail };
export type { RecommendationDetailProps };
