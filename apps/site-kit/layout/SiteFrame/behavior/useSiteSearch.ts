/* @layer site-kit @kind hook */
/**
 * The one search of the signed-in site, held by the frame. While its field has focus or
 * holds text, the site is searching: no section is current and the content pane shows
 * the results. Clearing the text (Escape, a result, a nav item) ends it.
 */
import { useCallback, useMemo, useState } from 'react';
import type { SectionNavSearch } from '@ds/composites/SectionNav';

const useSiteSearch = (placeholder: string) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const clear = useCallback(() => setQuery(''), []);

  const field = useMemo<SectionNavSearch>(
    () => ({ value: query, onChange: setQuery, placeholder, onFocusChange: setFocused }),
    [query, placeholder],
  );

  return { query, searching: focused || query.trim() !== '', field, clear };
};

export { useSiteSearch };
