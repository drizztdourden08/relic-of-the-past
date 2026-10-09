/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { SearchResultListProps } from '../SearchPalette.type';
import { IDLE_SCREEN_LIMIT } from '../SearchPalette.constants';
import { SearchResultRow } from './SearchResultRow';

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
