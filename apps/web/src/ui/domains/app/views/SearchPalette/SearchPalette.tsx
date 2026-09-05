/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';
import type { RunTargetDeps } from './behavior/run-target';
import { useSearchPalette } from './behavior/useSearchPalette';
import { SearchInput } from './sub-components/SearchInput';
import { SearchResultList } from './sub-components/SearchResultList';
import './SearchPalette.css';

/**
 * A single fixed element that morphs pill ⇄ panel (Jex's CommandSurface
 * technique): always mounted as a zero-size seed at top-center, it CSS-transitions its own
 * width/height/radius when `.is-open` is added, so the palette physically grows out of the
 * title-bar icon's summon point instead of cross-fading two separate widgets. Opened by
 * the title-bar search icon or Ctrl+K; closed by Escape or the scrim.
 */
interface SearchPaletteProps {
  navProps: TitleBarProps;
  navDeps: RunTargetDeps;
}

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
