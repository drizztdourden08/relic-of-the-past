/* @layer site-kit @kind hook */
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
