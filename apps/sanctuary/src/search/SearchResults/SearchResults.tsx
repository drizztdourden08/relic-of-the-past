/* @layer sanctuary-site @kind component */
import { SearchResults as ResultsPanel } from '@drizztdourden08/tessera/composites';
import { useSearchResults } from './behavior/useSearchResults';
import { useResultView } from './behavior/useResultView';
import { IDLE_MESSAGE, LOADING_MESSAGE, NO_MATCH_MESSAGE, OPEN_LABEL } from './SearchResults.constants';
import type { SearchResultsProps } from './SearchResults.type';
import './SearchResults.css';

const SearchResults = (props: SearchResultsProps) => {
  const { query, onDone } = props;
  const shown = query.trim();
  const results = useSearchResults(shown.toLowerCase(), onDone);
  const { groups, jumps, openKey } = useResultView(results);

  return (
    <ResultsPanel
      query={shown}
      count={results.total}
      jumps={jumps}
      onJump={openKey}
      groups={groups}
      onOpenGroup={openKey}
      openLabel={OPEN_LABEL}
      idleMessage={IDLE_MESSAGE}
      emptyMessage={results.loading ? LOADING_MESSAGE : NO_MATCH_MESSAGE}
      className="site-search"
    />
  );
};

export { SearchResults };
