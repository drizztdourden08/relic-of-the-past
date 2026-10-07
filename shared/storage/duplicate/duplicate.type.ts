/* @layer shared-storage @kind types */
/**
 * Duplicating an item installed from the Hookshop: one function per kind, each on the FileStore
 * port alone. It copies the item to a free new name, stamps `basedOn` into the copy's own
 * metadata, and writes nothing into the original.
 */
import type { FileStore } from '@shared/platform';
import type { BasedOn } from '@shared/store/based-on';

/** The copy's music pack folder, sprite file name, or language set id. */
type DuplicateOutcome = { name: string };

type DuplicateInstalled = (files: FileStore, installedName: string, basedOn: BasedOn) => Promise<DuplicateOutcome>;

export type { DuplicateInstalled, DuplicateOutcome };
