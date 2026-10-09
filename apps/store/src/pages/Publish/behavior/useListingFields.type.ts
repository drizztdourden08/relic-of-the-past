/* @layer store-site @kind types */
import type { useListingFields } from './useListingFields';

type ListingText = { name: string; summary: string; description: string; tags: readonly string[]; license: string; color: string };

type ListingFieldsState = ReturnType<typeof useListingFields>;

export type { ListingText, ListingFieldsState };
