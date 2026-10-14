/* @layer renderer-app @kind component */
import { useCallback, useMemo } from 'react';
import { changedPaths } from '@rotp/navigation';
import { buildSchema } from '@drizztdourden08/tessera/data';
import { Box } from '@drizztdourden08/tessera/primitives';
import { COLLECTION_SOURCES } from '@app/data-inspector/collection-sources';
import { certainOnly } from '@app/data-inspector/recommendations/accept-all-certain';
import { useComparisonScroll } from '@app/data-inspector/recommendations/use-comparison-scroll';
import { useRecommendationReview } from '@app/data-inspector/recommendations/useRecommendationReview';
import type { InspectorRow } from '../../DataInspector.type';
import { RecommendationActions } from './sub-components/RecommendationActions';
import { RecommendationPanes } from './sub-components/RecommendationPanes';
import { NOTHING_OPEN } from './RecommendationDetail.constants';
import type { RecommendationDetailProps } from './RecommendationDetail.type';
import { RecommendationSummary } from './sub-components/RecommendationSummary';
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
      <RecommendationPanes
        kind={selected.kind}
        source={source}
        schema={schema}
        current={current}
        proposed={proposed}
        paths={paths}
        tab={tab}
        onTabChange={onTabChange}
        onCommit={commit}
        scroll={scroll}
      />
    </Box>
  );
};

export { RecommendationDetail };
