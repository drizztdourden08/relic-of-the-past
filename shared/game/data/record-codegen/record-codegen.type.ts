/* @layer shared-game @kind types */
import type {
  ConnectionRecord, EnumerationEntry, ItemGroupRecord, ScreenRecord, TagRecord,
} from '../types';

interface FieldSpec<T> {
  order: readonly (keyof T & string)[];
  known: Record<keyof T, true>;
}

type Unnumbered<T extends { id: unknown }> = Omit<T, 'id'>;

type PendingScreenRecord = Unnumbered<ScreenRecord>;
type PendingConnectionRecord = Unnumbered<ConnectionRecord>;
type PendingTagRecord = Unnumbered<TagRecord>;
type PendingItemGroupRecord = Unnumbered<ItemGroupRecord>;
type PendingEnumerationRecord = Unnumbered<EnumerationEntry>;

export type {
  FieldSpec, PendingConnectionRecord, PendingEnumerationRecord, PendingItemGroupRecord, PendingScreenRecord, PendingTagRecord,
  Unnumbered,
};
