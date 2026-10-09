/* @layer store-api @kind logic */
import type { ListingEdit } from '@rotp/hub-contracts';
import { signPatchRef } from './sign-patch-ref';

const signEdit = async (edit: ListingEdit): Promise<ListingEdit> => {
  const [card, banner] = await Promise.all([signPatchRef(edit.patch.card), signPatchRef(edit.patch.banner)]);
  const patch = { ...edit.patch };
  if (card !== undefined) patch.card = card;
  if (banner !== undefined) patch.banner = banner;
  return { ...edit, patch };
};

export { signEdit };
