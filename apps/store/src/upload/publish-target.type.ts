/* @layer store-site @kind types */
import type { ItemCreateBody, ListingPatchBody, Container } from '@rotp/hub-contracts';
import type { Picture } from './resize-image.type';

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
