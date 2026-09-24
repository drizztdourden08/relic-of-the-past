/* @layer renderer-components @kind component */
/**
 * The search row above Home. The mark never moves: collapsed it is the only
 * thing in the row, and opening the nav lays the field in behind it, so the
 * mark ends up where a search field keeps its icon. Clicking the mark opens
 * the nav if needed and focuses the field.
 */
import { useEffect, useRef } from 'react';
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Icon } from '../../../primitives/Icon';
import { TextInput } from '../../../primitives/TextInput';
import { SearchSpark } from '../../SearchSpark';
import { CLEAR, GLYPH_BOX, SEARCH_MARK_SIZE } from '../SectionNav.constants';
import type { SectionNavSearch as Search } from '../SectionNav.type';
import './SectionNavSearch.css';

interface SectionNavSearchProps {
  search: Search;
  open: boolean;
  onOpen: () => void;
}

const SectionNavSearch = (props: SectionNavSearchProps) => {
  const { search, open, onOpen } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const focusWhenOpen = useRef(false);

  // The field only exists once the nav is open, so a click while collapsed focuses it after that render.
  useEffect(() => {
    if (open && focusWhenOpen.current) inputRef.current?.focus();
    focusWhenOpen.current = false;
  }, [open]);

  const handleMark = () => {
    if (open) {
      inputRef.current?.focus();
      return;
    }
    focusWhenOpen.current = true;
    onOpen();
  };

  return (
    <Box className={`section-nav__search${open ? ' section-nav__search--open' : ''}`}>
      {open && (
        <TextInput
          ref={inputRef}
          className="section-nav__search-input"
          type="text" // not "search": the browser adds its own clear button beside ours
          role="searchbox"
          enterKeyHint="search"
          value={search.value}
          placeholder={search.placeholder}
          aria-label={search.placeholder}
          onChange={(e) => search.onChange(e.target.value)}
          onFocus={() => search.onFocusChange?.(true)}
          onBlur={() => search.onFocusChange?.(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') search.onChange(''); }}
        />
      )}
      <Button variant="bare" className="section-nav__search-mark" onClick={handleMark} title="Search" aria-label="Search">
        <SearchSpark size={SEARCH_MARK_SIZE} />
      </Button>
      {open && search.value && (
        <Button variant="bare" className="section-nav__search-clear" onClick={() => search.onChange('')} aria-label="Clear search">
          <Icon paths={[CLEAR]} viewBox={GLYPH_BOX} size={14} />
        </Button>
      )}
    </Box>
  );
};

export { SectionNavSearch };
