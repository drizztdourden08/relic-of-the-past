/* @layer store-site @kind types */
import type { ItemResponse } from '@rotp/hub-contracts';

type UseRatingParams = {
  data: ItemResponse | null;
  meId: string;
  merge: (patch: Partial<ItemResponse>) => void;
};

export type { UseRatingParams };
