/* @layer store-site @kind types */
import type { StoreItem, StoreKind } from '@rotp/hub-contracts';
import type { Picture } from '../../../upload/resize-image';
import type { ListingText } from './useListingFields.type';
import type { PackState } from './usePack.type';

type Submission = {
  item: StoreItem | null;
  kind: StoreKind | null;
  text: ListingText;
  card: Picture | null;
  banner: Picture | null;
  pack: PackState;
  changelog: string;
};

export type { Submission };
