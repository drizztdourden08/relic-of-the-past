/* @layer store-site @kind hook */
/**
 * The listing's text fields, started from the item when editing one, what is wrong with
 * each, and what changed against the item. The description follows the short description
 * while it is empty or still a copy of it, until the author writes their own.
 */
import { useCallback, useMemo, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { DEFAULT_ITEM_COLOR } from '@shared/store/item-color';
import type { ListingPatchBody } from '@shared/store/schemas';
import { DEFAULT_LICENSE } from '../Publish.constants';
import { listingErrors } from './listing-errors';

type ListingText = { name: string; summary: string; description: string; tags: readonly string[]; license: string; color: string };

const EMPTY: ListingText = { name: '', summary: '', description: '', tags: [], license: DEFAULT_LICENSE, color: DEFAULT_ITEM_COLOR };

const textOf = (item: StoreItem | null): ListingText => (item
  ? { name: item.name, summary: item.summary, description: item.description, tags: item.tags, license: item.license, color: item.color }
  : EMPTY);

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

const useListingFields = (item: StoreItem | null) => {
  const [text, setText] = useState<ListingText>(() => textOf(item));
  const set = useCallback(<K extends keyof ListingText>(key: K, value: ListingText[K]) => setText((current) => ({ ...current, [key]: value })), []);

  const setSummary = useCallback((value: string) => setText((current) => ({
    ...current,
    summary: value,
    description: current.description === '' || current.description === current.summary ? value : current.description,
  })), []);

  /** True while the description is the short description's copy. */
  const following = text.summary !== '' && text.description === text.summary;
  const errors = useMemo(() => listingErrors(text), [text]);
  const patch = useMemo(() => changedText(textOf(item), text), [item, text]);

  return { text, set, setSummary, following, errors, patch };
};

type ListingFieldsState = ReturnType<typeof useListingFields>;

export { useListingFields, changedText, textOf };
export type { ListingFieldsState, ListingText };
