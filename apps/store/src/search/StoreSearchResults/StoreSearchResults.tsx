/* @layer store-site @kind component */
import { useMemo } from 'react';
import { SearchResults } from '@drizztdourden08/tessera/composites';
import type { SearchResultsGroup } from '@drizztdourden08/tessera/composites';
import { useStoreData } from '../../data/store-data-context/useStoreData';
import { matchItems } from '../../catalog/match-items';
import { itemPath } from '../../catalog/item-paths/item-path';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import type { StoreSearchResultsProps } from './StoreSearchResults.type';
import { IDLE_MESSAGE, LOADING_MESSAGE, NO_MATCH_MESSAGE, RESULTS_GROUP } from './StoreSearchResults.constants';
import './StoreSearchResults.css';

const StoreSearchResults = (props: StoreSearchResultsProps) => {
  const { query, onDone } = props;
  const { catalog } = useStoreData();
  const shown = query.trim();
  const matches = useMemo(() => matchItems(catalog.items, shown), [catalog.items, shown]);
  const groups = useMemo<SearchResultsGroup[]>(() => (matches.length === 0 ? [] : [{
    ...RESULTS_GROUP,
    count: matches.length,
    children: <ItemGrid items={matches} itemPath={itemPath} emptyMessage={NO_MATCH_MESSAGE} onOpen={onDone} />,
  }]), [matches, onDone]);

  return (
    <SearchResults
      query={shown}
      count={matches.length}
      groups={groups}
      idleMessage={IDLE_MESSAGE}
      emptyMessage={catalog.loading ? LOADING_MESSAGE : NO_MATCH_MESSAGE}
      className="store-search"
    />
  );
};

export { StoreSearchResults };
