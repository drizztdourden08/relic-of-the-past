/* @layer renderer-components @kind component */
import { Box, TextInput, Icon } from '@drizztdourden08/tessera/primitives';
import { SEARCH_ICON_PATHS } from '@drizztdourden08/tessera/composites';
import type { SearchInputProps } from '../SearchPalette.type';

const SearchInput = (props: SearchInputProps) => {
  const { inputRef, value, onChange, onKeyDown, resultCount } = props;

  return (
    <Box className="search-palette__input-row">
      <Icon paths={SEARCH_ICON_PATHS} size={16} className="search-palette__input-icon" />
      <TextInput
        ref={inputRef}
        className="search-palette__input"
        placeholder="Search settings, screens, anything..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded
        aria-controls="search-palette-results"
        aria-autocomplete="list"
      />
      {value && (
        <Box className="search-palette__count">{resultCount}</Box>
      )}
    </Box>
  );
};

export { SearchInput };
