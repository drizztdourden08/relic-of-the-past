/* @layer renderer-components @kind component */
import { CommandPalette } from '@drizztdourden08/tessera/composites';
import type { SearchPaletteProps } from './SearchPalette.type';
import { useSearchPalette } from './behavior/useSearchPalette';

const SearchPalette = (props: SearchPaletteProps) => {
  const { navProps, navDeps } = props;
  const { open, query, setQuery, groups, runItem, closePalette } = useSearchPalette(navProps, navDeps);

  return (
    <CommandPalette
      open={open}
      onClose={closePalette}
      query={query}
      onQueryChange={setQuery}
      groups={groups}
      onSelect={runItem}
      placeholder="Search settings, screens, anything..."
      label="Search"
    />
  );
};

export { SearchPalette };
