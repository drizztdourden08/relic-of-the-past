/* @layer store-site @kind types */
import type { ListingEdit, StoreVersion } from '@rotp/hub-contracts';

type Entry = { version: StoreVersion | null; edit: ListingEdit | null };

export type { Entry };
