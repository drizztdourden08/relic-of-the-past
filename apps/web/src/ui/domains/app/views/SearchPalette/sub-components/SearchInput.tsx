/* @layer renderer-components @kind component */
import type { KeyboardEvent, RefObject } from 'react';
import { Box } from '@ds/primitives/Box';
import { TextInput } from '@ds/primitives/TextInput';
import { Icon } from '@ds/primitives/Icon';
import { SEARCH_ICON_PATHS } from '../../TitleBar/TitleBar.constants';

interface SearchInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  resultCount: number;
}

const SearchInput = (props: SearchInputProps) => {
  const { inputRef, value, onChange, onKeyDown, resultCount } = props;

  return (
    <Box className="search-palette__input-row">
      <Icon paths={SEARCH_ICON_PATHS} size={16} className="search-palette__input-icon" />
      <TextInput
        ref={inputRef}
        className="search-palette__input"
        placeholder="Search settings, screens, anything…"
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
