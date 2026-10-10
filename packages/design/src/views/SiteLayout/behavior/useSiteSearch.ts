/* @layer site-kit @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { SideNavSearch } from '@drizztdourden08/tessera/composites';

const useSiteSearch = (placeholder: string) => {
  const [query, setQuery] = useState('');
  const clear = useCallback(() => setQuery(''), []);
  const field = useMemo<SideNavSearch>(() => ({ value: query, onChange: setQuery, placeholder }), [query, placeholder]);
  return { query, field, clear };
};

export { useSiteSearch };
