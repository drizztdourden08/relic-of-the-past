/* @layer shared-game @kind types */
import type { EntityKind, EnumerationId } from '../ids';
import type { ReviewMark } from '../review';

type EnumerationCategory =
  | 'world' | 'screen-status' | 'screen-kind' | 'interior-kind'
  | 'connection-kind' | 'connection-side' | 'actor-kind' | 'check-kind'
  | 'item-category' | 'item-origin' | 'review-status'
  | 'progress-tier';

interface EnumerationEntry {
  id: EnumerationId;
  category: EnumerationCategory;
  value: string;
  label: string;
  appliesTo: readonly EntityKind[];
  review?: ReviewMark;
}

export type { EnumerationCategory, EnumerationEntry };
