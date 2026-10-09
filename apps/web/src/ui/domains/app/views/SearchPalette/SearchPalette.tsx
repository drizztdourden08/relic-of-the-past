/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { SearchPaletteProps } from './SearchPalette.type';
import { useSearchPalette } from './behavior/useSearchPalette';
import { SearchInput } from './sub-components/SearchInput';
import { SearchResultList } from './sub-components/SearchResultList';
import './SearchPalette.css';

const SearchPalette = (props: SearchPaletteProps) => {
  const { navProps, navDeps } = props;
  const {
    open,
    query, setQuery,
    catalog, results, activeIndex, setActiveIndex,
    inputRef, handleKeyDown,
    runEntry, toggleEntry, closePalette,
  } = useSearchPalette(navProps, navDeps);

  return (
    <>
      {open && <Box className="search-scrim" onClick={closePalette} />}
      <Box className={`search-palette${open ? ' is-open' : ''}`} role="dialog" aria-label="Search" aria-hidden={!open}>
        <Text as="span" className="search-palette__topedge" aria-hidden />
        <SearchInput
          inputRef={inputRef}
          value={query}
          onChange={setQuery}
          onKeyDown={handleKeyDown}
          resultCount={results.length}
        />
        <Box className="search-palette__body">
          <SearchResultList
            catalog={catalog}
            results={results}
            query={query}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onSelect={runEntry}
            onToggle={toggleEntry}
          />
        </Box>
      </Box>
    </>
  );
};

export { SearchPalette };
