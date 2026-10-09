/* @layer store-site @kind types */
import type { StoreItem, StoreKind } from '@shared/store/types';
import type { Picture } from '../../../lib/resize-image';
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
