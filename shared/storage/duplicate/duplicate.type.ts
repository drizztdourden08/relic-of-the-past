/* @layer shared-storage @kind types */
import type { FileStore } from '@shared/platform';
import type { BasedOn } from '@shared/store/based-on';

type DuplicateOutcome = { name: string };

type DuplicateInstalled = (files: FileStore, installedName: string, basedOn: BasedOn) => Promise<DuplicateOutcome>;

export type { DuplicateInstalled, DuplicateOutcome };
