/* @layer store-site @kind types */
import type { ItemCreateBody, ListingPatchBody } from '@shared/store/schemas';
import type { Container } from '@shared/store/types';
import type { Picture } from '../lib/resize-image.type';

type PublishTarget = {
  itemId: string | null;
  itemName: string;
  isNew: boolean;
  draft: ItemCreateBody | null;
  patch: ListingPatchBody;
  card: Picture | null;
  banner: Picture | null;
  pack: { container: Container; changelog: string } | null;
};

export type { PublishTarget };
