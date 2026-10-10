/* @layer store-site @kind types */
import type { usePublications } from './usePublications';

type Publications = ReturnType<typeof usePublications>;

export type { Publications };
