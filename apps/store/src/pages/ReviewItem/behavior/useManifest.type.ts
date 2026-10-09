/* @layer store-site @kind types */
import type { PackSource } from '@domains/packs/pack-source.type';
import type { FirstEntry } from '@shared/store/manifest/read-first-entry';

type ManifestResult = { source: PackSource; entry: FirstEntry | null; error: string | null };

type ManifestState = { entry: FirstEntry | null; error: string | null; loading: boolean };

export type { ManifestResult, ManifestState };
