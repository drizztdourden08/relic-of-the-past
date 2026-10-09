/* @layer store-site @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { StoreItem } from '@rotp/hub-contracts';
import { changedText } from './changed-text';
import { listingErrors } from './listing-errors';
import { textOf } from './text-of';
import type { ListingText } from './useListingFields.type';

const useListingFields = (item: StoreItem | null) => {
  const [text, setText] = useState<ListingText>(() => textOf(item));
  const set = useCallback(<K extends keyof ListingText>(key: K, value: ListingText[K]) => setText((current) => ({ ...current, [key]: value })), []);

  const setSummary = useCallback((value: string) => setText((current) => ({
    ...current,
    summary: value,
    description: current.description === '' || current.description === current.summary ? value : current.description,
  })), []);

  const following = text.summary !== '' && text.description === text.summary;
  const errors = useMemo(() => listingErrors(text), [text]);
  const patch = useMemo(() => changedText(textOf(item), text), [item, text]);

  return { text, set, setSummary, following, errors, patch };
};

export { useListingFields };
