/* @layer store-site @kind hook */
/**
 * The listing's text fields, started from the item when editing one, and what changed
 * against it. The fields are checked with the same schema store-api parses a new item with.
 */
import { useMemo, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { DEFAULT_ITEM_COLOR } from '@shared/store/item-color';
import { itemCreateSchema } from '@shared/store/schemas';
import type { ListingPatchBody } from '@shared/store/schemas';
import { DEFAULT_LICENSE } from '../Publish.constants';

type ListingText = { name: string; summary: string; description: string; tags: readonly string[]; license: string; color: string };

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  summary: 'One line',
  description: 'Description',
  tags: 'Tags',
  license: 'Licence',
  color: 'Colour',
};

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
  const set = <K extends keyof ListingText>(key: K, value: ListingText[K]) => setText((current) => ({ ...current, [key]: value }));

  const problem = useMemo(() => {
    const parsed = itemCreateSchema.safeParse({ kind: item?.kind ?? 'music', ...text, tags: [...text.tags] });
    if (parsed.success) return null;
    const issue = parsed.error.issues[0];
    const field = FIELD_LABELS[String(issue?.path[0])] ?? 'Listing';
    if (issue?.code === 'too_small') return `${field} is empty.`;
    return issue ? `${field}: ${issue.message}` : 'Check the listing.';
  }, [text, item]);

  const patch = useMemo(() => changedText(textOf(item), text), [item, text]);

  return { text, set, problem, patch };
};

type ListingFieldsState = ReturnType<typeof useListingFields>;

export { useListingFields, changedText, textOf };
export type { ListingFieldsState, ListingText };
