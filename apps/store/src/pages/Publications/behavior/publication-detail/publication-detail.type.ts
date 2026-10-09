/* @layer store-site @kind types */
import type { ListingEdit, StoreVersion } from '@shared/store/types';

type Entry = { version: StoreVersion | null; edit: ListingEdit | null };

export type { Entry };
