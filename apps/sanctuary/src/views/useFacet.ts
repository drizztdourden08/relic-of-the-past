/* @layer sanctuary-site @kind hook */
/**
 * One FilterBar facet: a closed set of values read off the rows, a hidden set toggled from
 * the bar, and the predicate that applies it. Transient, like the search: the clause
 * list is the durable filter.
 */
import { useCallback, useMemo, useState } from 'react';
import type { FilterFacet } from '@ds/composites/FilterBar';

type UseFacetParams<T> = {
  id: string;
  label: string;
  rows: readonly T[];
  valueOf: (row: T) => string;
};

const useFacet = <T>(params: UseFacetParams<T>) => {
  const { id, label, rows, valueOf } = params;
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  const onToggle = useCallback((value: string) => {
    setHidden((was) => {
      const next = new Set(was);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const facet = useMemo<FilterFacet>(() => {
    const values = [...new Set(rows.map(valueOf))].sort((a, b) => a.localeCompare(b));
    return { id, label, options: values.map((value) => ({ id: value, label: value })), hidden, onToggle };
  }, [id, label, rows, valueOf, hidden, onToggle]);

  const apply = useCallback(
    (list: readonly T[]) => (hidden.size ? list.filter((row) => !hidden.has(valueOf(row))) : list),
    [hidden, valueOf],
  );

  return { facet, apply };
};

export { useFacet };
export type { UseFacetParams };
