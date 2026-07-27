/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { SearchEntry } from '../SearchPalette.type';
import { SearchResultRow } from './SearchResultRow';

interface SearchResultListProps {
  catalog: SearchEntry[];
  results: SearchEntry[];
  query: string;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onSelect: (entry: SearchEntry) => void;
  onToggle: (entry: SearchEntry) => void;
}

const IDLE_SCREEN_LIMIT = 8;

const SearchResultList = (props: SearchResultListProps) => {
  const { catalog, results, query, activeIndex, setActiveIndex, onSelect, onToggle } = props;
  const isIdle = query.trim().length === 0;
  const items = isIdle ? catalog.filter((e) => e.kind === 'screen').slice(0, IDLE_SCREEN_LIMIT) : results;

  return (
    <Box className="search-palette__list" id="search-palette-results" role="listbox">
      {isIdle && <Text className="search-palette__list-heading">Screens</Text>}

      {!isIdle && items.length === 0 && (
        <Box className="search-palette__empty">No results for &ldquo;{query}&rdquo;</Box>
      )}

      {items.map((entry, i) => (
        <SearchResultRow
          key={entry.id}
          entry={entry}
          active={!isIdle && i === activeIndex}
          onHover={() => setActiveIndex(i)}
          onSelect={() => onSelect(entry)}
          onToggle={() => onToggle(entry)}
        />
      ))}
    </Box>
  );
};

export { SearchResultList };
