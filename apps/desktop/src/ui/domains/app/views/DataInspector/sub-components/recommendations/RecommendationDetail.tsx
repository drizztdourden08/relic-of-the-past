/* @layer renderer-app @kind component */
import { useCallback, useMemo } from 'react';
import { changedPaths } from '@rotp/navigation';
import { buildSchema } from '@drizztdourden08/tessera/data';
import { Box } from '@drizztdourden08/tessera/primitives';
import { COLLECTION_SOURCES } from '../../behavior/collection-sources';
import { certainOnly } from '../../behavior/recommendations/accept-all-certain';
import { highlightedLinesFor } from '../../behavior/recommendations/comparison-lines';
import { useComparisonScroll } from '../../behavior/recommendations/use-comparison-scroll';
import { useRecommendationReview } from '../../behavior/recommendations/useRecommendationReview';
import type { InspectorRow } from '../../DataInspector.type';
import { ComparisonPane } from './ComparisonPane';
import { ProposalForm } from './ProposalForm';
import { RecommendationActions } from './RecommendationActions';
import {
  CURRENT_TITLE, NO_CURRENT, NO_PROPOSAL, NOTHING_OPEN, PROPOSED_TITLE,
} from './RecommendationDetail.constants';
import type { RecommendationDetailProps } from './RecommendationDetail.type';
import { RecommendationSummary } from './RecommendationSummary';
import './RecommendationDetail.css';

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
          title={CURRENT_TITLE}
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
          title={PROPOSED_TITLE}
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
