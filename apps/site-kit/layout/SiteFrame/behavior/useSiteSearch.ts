/* @layer site-kit @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { SideNavSearch } from '@drizztdourden08/tessera/composites';

const useSiteSearch = (placeholder: string) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const clear = useCallback(() => setQuery(''), []);

  const field = useMemo<SideNavSearch>(
    () => ({ value: query, onChange: setQuery, placeholder, onFocusChange: setFocused }),
    [query, placeholder],
  );

  return { query, searching: focused || query.trim() !== '', field, clear };
};

export { useSiteSearch };
