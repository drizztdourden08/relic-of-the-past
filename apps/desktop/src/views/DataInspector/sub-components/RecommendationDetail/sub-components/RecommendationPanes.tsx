/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { highlightedLinesFor } from '@app/data-inspector/recommendations/comparison-lines';
import { CURRENT_TITLE, NO_CURRENT, NO_PROPOSAL, PROPOSED_TITLE } from '../RecommendationDetail.constants';
import type { RecommendationPanesProps } from '../RecommendationDetail.type';
import { ComparisonPane } from './ComparisonPane';
import { ProposalForm } from './ProposalForm';

const RecommendationPanes = (props: RecommendationPanesProps) => {
  const {
    kind, source, schema, current, proposed, paths, tab, onTabChange, onCommit, scroll,
  } = props;

  return (
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
            kind={kind}
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
            kind={kind}
            schema={schema}
            config={source.config}
            record={proposed}
            changedPaths={paths}
            onCommit={onCommit}
          />
        )}
        scroll={scroll.proposed}
      />
    </Box>
  );
};

export { RecommendationPanes };
