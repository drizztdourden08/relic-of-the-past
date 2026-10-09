/* @layer shared-game @kind types */
import type { EntityKind, TagId } from '../ids';
import type { ReviewMark } from '../review';

interface TagRecord {
  id: TagId;
  name: string;
  namespace: string;
  value: string;
  label: string;
  namespaceLabel: string;
  appliesTo: readonly EntityKind[];
  review?: ReviewMark;
}

export type { TagRecord };
