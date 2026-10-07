/* @layer renderer-components @kind types */
import type { SchemaLike } from '../../data/schema/build-schema';
import type { FilterClause } from '../../data/filter/clause';

interface FilterFacetOption {
  id: string;
  label: string;
}

/**
 * One enumerated show/hide facet: a closed set of ids toggled from a dropdown
 * of checkboxes. The facet is state, not a predicate: the caller keeps the
 * hidden set and applies it to its own rows, the same way clauses work.
 */
interface FilterFacet {
  id: string;
  /** Trigger label, e.g. 'Show types'. */
  label: string;
  options: readonly FilterFacetOption[];
  hidden: ReadonlySet<string>;
  onToggle: (optionId: string) => void;
}

interface FilterBarProps {
  /** Free-text search, the always-present part of the bar. */
  search: string;
  /** Filters are data: the query is reported here, never applied by the bar. */
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  /** Accessible name for the search box. */
  searchLabel?: string;
  /**
   * Either a raw field list or an already-built index. Both are accepted.
   * Omit (together with clauses/onChange) to run the bar search-only.
   */
  schema?: SchemaLike;
  clauses?: readonly FilterClause[];
  /** The only way FilterBar reports a clause change. */
  onChange?: (next: readonly FilterClause[]) => void;
  /** Enumerated facets, rendered at the end of the bar. */
  facets?: readonly FilterFacet[];
  className?: string;
}

export type { FilterBarProps, FilterFacet, FilterFacetOption };
