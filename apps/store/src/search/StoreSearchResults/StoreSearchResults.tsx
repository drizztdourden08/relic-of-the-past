/* @layer store-site @kind component */
/**
 * The site's search pane, shown in place of the page while the nav's search is in use: an
 * empty state until something is typed, then every matching item from the catalogue as
 * cards. Opening one ends the search.
 */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Text } from '@ds/primitives/Text';
import { SearchSpark } from '@ds/composites/SearchSpark';
import { useStoreData } from '../../data/store-data-context';
import { matchItems } from '../../catalog/match-items';
import { itemPath } from '../../catalog/item-paths';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import './StoreSearchResults.css';

type StoreSearchResultsProps = {
  query: string;
  onDone: () => void;
};

const IDLE_MARK_SIZE = 40;

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
export type { StoreSearchResultsProps };
