/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../../shared/store/types';
import type { ItemPatch } from '../../db/items-repo.type';
import { decidedEdit } from './decided-edit';
import { editOf } from './edit-of';
import type { Decided } from './mark-decided.type';
import { replaceEdit } from './replace-edit';

const markEditRejected = (item: StoreItem, editId: string, decided: Decided): ItemPatch => {
  const edit = editOf(item, editId);
  return { listingEdits: replaceEdit(item, { ...edit, review: decidedEdit(edit.review, 'rejected', decided) }) };
};

export { markEditRejected };
