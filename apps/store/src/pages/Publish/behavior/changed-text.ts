/* @layer store-site @kind logic */
import type { ListingPatchBody } from '@shared/store/schemas';
import type { ListingText } from './useListingFields.type';

const sameTags = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((tag, i) => tag === b[i]);

const changedText = (from: ListingText, to: ListingText): ListingPatchBody => {
  const patch: ListingPatchBody = {};
  if (to.name.trim() !== from.name) patch.name = to.name.trim();
  if (to.summary.trim() !== from.summary) patch.summary = to.summary.trim();
  if (to.description.trim() !== from.description) patch.description = to.description.trim();
  if (to.license.trim() !== from.license) patch.license = to.license.trim();
  if (to.color !== from.color) patch.color = to.color;
  if (!sameTags(to.tags, from.tags)) patch.tags = [...to.tags];
  return patch;
};

export { changedText };
