/* @layer shared-storage @kind types */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { BasedOn } from '@rotp/game-data';

type DuplicateOutcome = { name: string };

type DuplicateInstalled = (files: FileStore, installedName: string, basedOn: BasedOn) => Promise<DuplicateOutcome>;

export type { DuplicateInstalled, DuplicateOutcome };
