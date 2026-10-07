/* @layer store-site @kind types */
import type { ItemCreateBody, ListingPatchBody } from '@shared/store/schemas';
import type { Container } from '@shared/store/types';
import type { Picture } from '../lib/resize-image';

/**
 * One publish as the upload queue carries it: the draft to create, the pictures and listing
 * changes to send, then the pack. Each step clears what it sent, so a job restored after a
 * reload goes on from the first thing still to do. Plain data and Blobs only, for IndexedDB.
 */
type PublishTarget = {
  /** Null until the draft exists. */
  itemId: string | null;
  itemName: string;
  /** Whether this publish creates the item; its listing then goes with the draft. */
  isNew: boolean;
  /** The new item's listing; null once the draft is created. */
  draft: ItemCreateBody | null;
  /** The listing changes still to send; the pictures join it once uploaded. */
  patch: ListingPatchBody;
  card: Picture | null;
  banner: Picture | null;
  /** Null for a listing edit, which sends no pack. */
  pack: { container: Container; changelog: string } | null;
};

export type { PublishTarget };
