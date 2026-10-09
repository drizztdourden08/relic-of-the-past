/* @layer store-site @kind types */
import type { useCatalog } from './useCatalog';

type Catalog = ReturnType<typeof useCatalog>;

export type { Catalog };
