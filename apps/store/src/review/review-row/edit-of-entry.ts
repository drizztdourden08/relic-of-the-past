/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';

const editOfEntry = (entry: ReviewEntry) => {
  const { item, target } = entry;
  return target.kind === 'listing' ? item.listingEdits.find((edit) => edit.id === target.editId) ?? null : null;
};

export { editOfEntry };
