/* @layer store-site @kind types */
import type { PackSource } from '@rotp/design/packs';
import type { FirstEntry } from '@rotp/hub-contracts';

type ManifestResult = { source: PackSource; entry: FirstEntry | null; error: string | null };

type ManifestState = { entry: FirstEntry | null; error: string | null; loading: boolean };

export type { ManifestResult, ManifestState };
