/* @layer shared-game @kind logic */
/**
 * A recommendation's id, derived from WHAT it is about.
 *
 * This is the load-bearing decision of the whole module. A counter would mint a
 * fresh id on every detection pass, so the same finding would pile up as a new
 * row each time the player walked back onto a screen, and a dismissal would be
 * forgotten the moment the finding was seen again. Deriving the id from content
 * makes re-detection idempotent: the second pass produces the id the first pass
 * produced, collapses onto that entry, and the decision recorded against it
 * still applies.
 *
 * What goes in is the finding's IDENTITY, never its payload. The proposed record
 * is deliberately excluded: nav data attached from the live flood shifts between
 * passes as the player moves, so hashing the record would change the id for a
 * finding that has not changed at all.
 */
import type { EntityKind } from '../data/types';
import type { DraftRecommendation } from './types';

/**
 * FNV-1a, 32-bit. Not a security hash and not trying to be: it needs to be
 * stable across runs and across processes (so a persisted id still matches after
 * a restart) and cheap enough to run per finding per pass. `Math.imul` keeps the
 * multiply in 32-bit integer space, which a plain `*` would not.
 */
const fnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

/** The identity parts a draft contributes to its own id. */
type Identifiable = Pick<DraftRecommendation, 'kind' | 'action' | 'targetId' | 'screenId' | 'detector' | 'key'>;

/**
 * The identity parts, in a fixed order, joined through `JSON.stringify` instead
 * of a separator character. Any separator can in principle occur inside a
 * detector name or a field path, and two findings whose parts join to the same
 * string would share an id and silently swallow one another; quoting removes
 * that class of collision instead of betting against it.
 *
 * `key` carries whatever `targetId` and `screenId` do not: a `create` has no
 * target, so without it every connection proposed from one screen would collide.
 */
const identityOf = (draft: Identifiable): string => JSON.stringify([
  draft.kind,
  draft.action,
  draft.detector,
  draft.screenId ?? '',
  draft.targetId ?? '',
  draft.key ?? '',
]);

/**
 * `rec-<kind>-<action>-<hash>`. The readable head makes a persisted file
 * skimmable, and the hash carries the rest of the identity.
 */
const recommendationId = <K extends EntityKind>(draft: DraftRecommendation<K>): string =>
  `rec-${draft.kind}-${draft.action}-${fnv1a(identityOf(draft))}`;

export { fnv1a, identityOf, recommendationId };
export type { Identifiable };
