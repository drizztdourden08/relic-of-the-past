/* @layer renderer-stores @kind types */
import type { HomeResponse, ItemCardView } from '@rotp/hub-contracts';

interface CatalogState {
  home: HomeResponse | null;
  items: ItemCardView[];
  loading: boolean;
  error: string | null;
}

interface HookshopCatalogStore extends CatalogState {
  loaded: boolean;
  generation: number;
  load: (onSignedOut: () => void) => Promise<void>;
  clear: () => void;
}

export type { CatalogState, HookshopCatalogStore };
