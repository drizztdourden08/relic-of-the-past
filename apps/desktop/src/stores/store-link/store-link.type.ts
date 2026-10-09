/* @layer renderer-stores @kind types */
import type { CatalogLink } from '@drizztdourden08/brock-catalog/renderer';

interface StoreLinkStore {
  pending: CatalogLink | null;
  offer: (link: CatalogLink) => void;
  take: () => CatalogLink | null;
}

export type { StoreLinkStore };
