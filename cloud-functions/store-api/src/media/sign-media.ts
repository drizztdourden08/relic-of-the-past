/* @layer store-api @kind logic */
/** The bucket is private, so every picture leaves the API with a signed link. The link is
 *  added on the way out and never stored; the key stays the picture's identity. */
import type { ItemCardView } from '../../../../shared/store/home-types';
import type { ListingEdit, MediaRef, StoreItem } from '../../../../shared/store/types';
import { storeBucket } from '../storage/store-bucket';

const WEBP = 'image/webp';

const signRef = async (ref: MediaRef | null): Promise<MediaRef | null> =>
  (ref ? { ...ref, url: await storeBucket.signPreview(ref.key, WEBP) } : null);

/** A patch field left out stays left out; null (the picture removed) stays null. */
const signPatchRef = (ref: MediaRef | null | undefined): Promise<MediaRef | null | undefined> =>
  (ref === undefined ? Promise.resolve(undefined) : signRef(ref));

const signEdit = async (edit: ListingEdit): Promise<ListingEdit> => {
  const [card, banner] = await Promise.all([signPatchRef(edit.patch.card), signPatchRef(edit.patch.banner)]);
  const patch = { ...edit.patch };
  if (card !== undefined) patch.card = card;
  if (banner !== undefined) patch.banner = banner;
  return { ...edit, patch };
};

const signCard = async (view: ItemCardView): Promise<ItemCardView> => {
  const [card, banner] = await Promise.all([signRef(view.card), signRef(view.banner)]);
  return { ...view, card, banner };
};

const signItem = async (item: StoreItem): Promise<StoreItem> => {
  const [card, banner, listingEdits] = await Promise.all([
    signRef(item.card),
    signRef(item.banner),
    Promise.all(item.listingEdits.map(signEdit)),
  ]);
  return { ...item, card, banner, listingEdits };
};

const signCards = (views: ItemCardView[]): Promise<ItemCardView[]> => Promise.all(views.map(signCard));

const signItems = (items: StoreItem[]): Promise<StoreItem[]> => Promise.all(items.map(signItem));

export { signCard, signCards, signItem, signItems };
