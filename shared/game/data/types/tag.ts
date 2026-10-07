/* @layer shared-game @kind types */
import type { EntityKind, TagId } from './ids';

/**
 * One term of the shared tag vocabulary, as a first-class record.
 *
 * A tag reads `namespace:value`, always two levels, with the separator
 * required. That shape is the whole point: the first level groups the
 * vocabulary so it can be browsed and searched, and the second names one term
 * inside that group. Every record that carries tags now stores TagIds, so a
 * term is a relationship to this collection instead of a string repeated a
 * few hundred times.
 *
 * `name` holds the joined key and is therefore redundant with
 * `namespace` + `value`. It is stored anyway for two reasons: it is the one
 * string the rest of the app matches on (every semantic read still asks for
 * `barrier:small-key`, not for a number), and it is what makes the collection
 * greppable and self-describing on disk. A test asserts the three stay in step.
 */
interface TagRecord {
  id: TagId;
  /** `namespace:value`, the vocabulary's own key and this record's display name. */
  name: string;
  /** First level of the hierarchy: the part before the separator. */
  namespace: string;
  /** Second level: the part after the separator. */
  value: string;
  /** Human-readable name for the term. */
  label: string;
  /** Human-readable name for the namespace, so the hierarchy reads in a UI. */
  namespaceLabel: string;
  /** Which collections' `tags` field this term belongs on. */
  appliesTo: readonly EntityKind[];
}

export type { TagRecord };
