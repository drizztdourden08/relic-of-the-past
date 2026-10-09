/* @layer site-kit @kind types */
type UseFacetParams<T> = {
  id: string;
  label: string;
  rows: readonly T[];
  valueOf: (row: T) => string;
};

export type { UseFacetParams };
