/* @layer shared-game @kind types */
import type { EntityKind, EnumerationId } from './ids';

/**
 * The closed-set fields that stay baked into their record as plain literals
 * (a `ScreenRecord.world` is still `'light' | 'dark'`, never a foreign key) but
 * whose display names get one shared source instead of being redeclared at
 * every place that renders one, where they would drift apart.
 */
type EnumerationCategory =
  | 'world' | 'screen-status' | 'screen-kind' | 'interior-kind'
  | 'connection-kind' | 'connection-side' | 'actor-kind' | 'check-kind'
  | 'item-category' | 'item-origin' | 'review-status'
  // Labels the save's progress indicator byte. Unlike the rest it never becomes a generated union,
  // because the field it labels holds the NUMBER and must not be retyped to string literals
  // (scripts/generate-enum-types.mjs keeps it out of CATEGORY_TYPE_NAMES for exactly that reason).
  | 'progress-tier';

/** One labeled value of one category, such as `{ category: 'world', value: 'light', label: 'Light World' }`. */
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
