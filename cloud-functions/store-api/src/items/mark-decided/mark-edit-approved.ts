/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import type { ItemPatch } from '../../db/items-repo.type';
import { decidedEdit } from './decided-edit';
import { editOf } from './edit-of';
import type { Decided } from './mark-decided.type';
import { replaceEdit } from './replace-edit';

const markEditApproved = (item: StoreItem, editId: string, decided: Decided): ItemPatch => {
  const edit = editOf(item, editId);
  const approved = { ...edit, review: decidedEdit(edit.review, 'approved', decided) };
  return { ...edit.patch, listingEdits: replaceEdit(item, approved), updatedAt: decided.at };
};

export { markEditApproved };
