/* @layer electron-main @kind types */
import type { FileTarget, Unnumbered } from '@rotp/game-data';
import type { AllocatableKind } from '../id-allocator';

interface RecordWriterSpec<T extends { id: string }> {
  kind: AllocatableKind;
  target: (record: Unnumbered<T>) => FileTarget;
  serialize: (record: T) => string;
  recordType: string;
}

export type { RecordWriterSpec };
