/* @layer shared-game @kind types */
import type { EntityKind, EnumerationId } from './ids';

/**
 * The closed-set fields that stay baked into their record as plain literals
 * (a `ScreenRecord.world` is still `'light' | 'dark'`, never a foreign key) but
 * whose display names deserve one shared source instead of being redeclared —
 * and left to drift — at every place that renders one.
 */
type EnumerationCategory =
  | 'world' | 'screen-status' | 'screen-kind' | 'interior-kind'
  | 'connection-kind' | 'connection-side' | 'actor-kind' | 'check-kind'
  | 'item-category' | 'item-origin';

/** One labeled value of one category — e.g. `{ category: 'world', value: 'light', label: 'Light World' }`. */
interface EnumerationEntry {
  id: EnumerationId;
  category: EnumerationCategory;
  /** The literal already stored on the record, e.g. `'light'`. */
  value: string;
  label: string;
  /** Which record kinds carry a field this category labels. */
  appliesTo: readonly EntityKind[];
}

export type { EnumerationCategory, EnumerationEntry };
