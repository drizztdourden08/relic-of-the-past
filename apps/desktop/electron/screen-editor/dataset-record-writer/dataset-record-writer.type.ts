/* @layer electron-main @kind types */
import type { FileTarget } from '@shared/game/data/record-file-targets';
import type { Unnumbered } from '@shared/game/data/record-codegen';
import type { AllocatableKind } from '../id-allocator';

interface RecordWriterSpec<T extends { id: string }> {
  kind: AllocatableKind;
  target: (record: Unnumbered<T>) => FileTarget;
  serialize: (record: T) => string;
  recordType: string;
}

export type { RecordWriterSpec };
