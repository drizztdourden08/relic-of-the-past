/* @layer store-site @kind component */
import { useMemo } from 'react';
import { Box, EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { SearchSpark } from '@drizztdourden08/tessera/composites';
import { useStoreData } from '../../data/store-data-context/useStoreData';
import { matchItems } from '../../catalog/match-items';
import { itemPath } from '../../catalog/item-paths/item-path';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import type { StoreSearchResultsProps } from './StoreSearchResults.type';
import { IDLE_MARK_SIZE } from './StoreSearchResults.constants';
import './StoreSearchResults.css';

const summaryOf = (total: number, shown: string): string => {
  if (total === 0) return `Nothing matches "${shown}"`;
  return total === 1 ? `1 item matches "${shown}"` : `${total} items match "${shown}"`;
};

const StoreSearchResults = (props: StoreSearchResultsProps) => {
  const { query, onDone } = props;
  const { catalog } = useStoreData();
  const shown = query.trim();
  const matches = useMemo(() => matchItems(catalog.items, shown), [catalog.items, shown]);

  if (!shown) {
    return (
      <Box as="section" className="store-search store-search--idle" aria-label="Search">
        <EmptyState icon={<SearchSpark size={IDLE_MARK_SIZE} />} message="Type to search every music pack, character and language." />
      </Box>
    );
  }

  const noMatch = catalog.loading ? 'Loading the Hookshop...' : 'Try a shorter word, or part of a name or an author.';
  return (
    <Box as="section" className="store-search" aria-label="Search results">
      <Text as="p" className="store-search__summary">{summaryOf(matches.length, shown)}</Text>
      <ItemGrid items={matches} itemPath={itemPath} emptyMessage={noMatch} onOpen={onDone} />
    </Box>
  );
};

export { StoreSearchResults };
