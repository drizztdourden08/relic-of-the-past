/* @layer shared-game @kind logic */
/**
 * Every live reference to a deletable record, read off the registry rather
 * than re-imported from source data files by hand — the same "read every
 * record of kind X off the store" shape `find`/`all` already use (facade.ts),
 * so this stays correct as the data changes instead of drifting from a second,
 * hand-maintained list.
 *
 * The delete-guard UI is the consumer: before removing a record, show what
 * still points at it. Tag and item group are answered here; the six
 * record-facade collections are answered by dataset-references.ts and joined
 * onto the same table below.
 *
 * Only the fields real records carry TODAY are walked. A `tags` array is
 * read defensively (optional chaining) rather than assumed present, so a kind
 * whose `tags` field is optional and often absent (e.g. `CheckRecord.tags` —
 * only the content family populates it) is skipped rather than crashed on.
 */
import { all } from '../registry';
import {
  referencesToActor, referencesToArea, referencesToCheck, referencesToDungeon,
  referencesToItem, referencesToLocation,
} from './dataset-references';
import type { EntityKind, Requirement } from '../types';
import type { ReferenceHit } from './reference-index.type';

/** Whether a Requirement tree contains a `count` leaf naming this item group, anywhere in the tree. */
const requirementUsesGroup = (req: Requirement, groupId: string): boolean => {
  if ('count' in req) return req.count.groupId === groupId;
  if ('allOf' in req) return req.allOf.some(sub => requirementUsesGroup(sub, groupId));
  if ('anyOf' in req) return req.anyOf.some(sub => requirementUsesGroup(sub, groupId));
  return false;
};

/** `record.tags` is a branded `readonly TagId[]`; the id being searched for is a plain
 *  runtime string (same rationale as the facade's getters — see facade.ts). */
const carriesTag = (tags: readonly string[] | undefined, id: string): boolean => tags?.includes(id) ?? false;

const referencesToTag = (id: string): ReferenceHit[] => {
  const hits: ReferenceHit[] = [];

  for (const screen of all('screen')) {
    if (carriesTag(screen.tags, id)) hits.push({ kind: 'screen', id: screen.id, field: 'tags' });
  }
  for (const connection of all('connection')) {
    if (carriesTag(connection.tags, id)) hits.push({ kind: 'connection', id: connection.id, field: 'tags' });
  }
  for (const check of all('check')) {
    if (carriesTag(check.tags, id)) hits.push({ kind: 'check', id: check.id, field: 'tags' });
  }

  return hits;
};

const referencesToItemGroup = (id: string): ReferenceHit[] => {
  const hits: ReferenceHit[] = [];

  for (const check of all('check')) {
    if (check.requirements && requirementUsesGroup(check.requirements, id)) {
      hits.push({ kind: 'check', id: check.id, field: 'requirements' });
    }
  }
  for (const connection of all('connection')) {
    if (connection.requirements && requirementUsesGroup(connection.requirements, id)) {
      hits.push({ kind: 'connection', id: connection.id, field: 'requirements' });
    }
  }
  for (const actor of all('actor')) {
    if (actor.clearedBy && requirementUsesGroup(actor.clearedBy, id)) {
      hits.push({ kind: 'actor', id: actor.id, field: 'clearedBy' });
    }
  }

  return hits;
};

/**
 * The reverse index, one entry per collection that can be deleted.
 *
 * A table rather than a chain of ternaries: eight kinds answer here now, the
 * six newer ones live in dataset-references.ts, and a kind that gains a delete
 * path later adds a row instead of another branch. `ReferenceTarget` is what
 * the delete-guard narrows against, so a kind with no entry cannot be asked.
 */
const REVERSE_INDEX = {
  tag: referencesToTag,
  'item-group': referencesToItemGroup,
  check: referencesToCheck,
  item: referencesToItem,
  dungeon: referencesToDungeon,
  area: referencesToArea,
  location: referencesToLocation,
  actor: referencesToActor,
} as const satisfies Partial<Record<EntityKind, (id: string) => ReferenceHit[]>>;

type ReferenceTarget = keyof typeof REVERSE_INDEX;

const REFERENCE_TARGETS = Object.keys(REVERSE_INDEX) as readonly ReferenceTarget[];

const referencesTo = (targetKind: ReferenceTarget, id: string): ReferenceHit[] =>
  REVERSE_INDEX[targetKind](id);

export { REFERENCE_TARGETS, referencesTo };
export type { ReferenceTarget };
