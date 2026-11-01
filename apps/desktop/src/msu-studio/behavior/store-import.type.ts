/* @layer renderer-components @kind types */
import type * as msuStore from '@app/storage/msu-store';

type StoreImport = Awaited<ReturnType<typeof msuStore.importMsu>>;

export type { StoreImport };
