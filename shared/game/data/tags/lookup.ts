/* @layer shared-game @kind logic */
/**
 * Both directions of the tag relationship, as plain maps.
 *
 * Records store TagIds, but every rule in the app is written against the KEY
 * (`barrier:small-key`, `env:outdoor`) — a number carries no meaning to a
 * traversal rule. So the boundary between the two lives here, and nowhere else:
 * a reader converts once as it takes `record.tags`, and a writer converts once
 * as it hands a draft back.
 *
 * Built straight off `ALL_TAGS` rather than off the registry, so this module has
 * no dependency on seeding order and can be imported from anywhere in the
 * dataset, including by the facade itself.
 *
 * An id with no record, or a key with no record, is dropped rather than
 * substituted. A tag that does not resolve carries no meaning, and a
 * stand-in would make a genuine dangling reference look like a real term.
 */
import { ALL_TAGS } from './tags';
import { replaceAll } from '../registry';
import type { EntityKind, TagId, TagRecord } from '../types';
import type { ConnectionTag } from '../taxonomy/connection-tags';
import type { ContentTag } from '../taxonomy/check-content-tags';
import type { ScreenTag } from '../taxonomy/screen-tags';

const SEPARATOR = ':';

const byId = new Map<string, TagRecord>(ALL_TAGS.map(tag => [tag.id, tag]));
const byKey = new Map<string, TagRecord>(ALL_TAGS.map(tag => [tag.name, tag]));

/** Splits a raw entry into its two levels, or null when it has no separator. */
const splitTagKey = (key: string): { namespace: string; value: string } | null => {
  const at = key.indexOf(SEPARATOR);
  if (at <= 0 || at >= key.length - 1) return null;
  return { namespace: key.slice(0, at), value: key.slice(at + 1) };
};

/** True for a raw entry that reads `namespace:value`. */
const isTagKey = (key: string): boolean => splitTagKey(key) !== null;

const tagById = (id: string): TagRecord | undefined => byId.get(id);

const tagByKey = (key: string): TagRecord | undefined => byKey.get(key);

/** The key one id stands for, or undefined when nothing is registered under it. */
const tagKey = (id: string): string | undefined => byId.get(id)?.name;

/** The id one key resolves to, or undefined when the vocabulary has no such term. */
const tagIdForKey = (key: string): TagId | undefined => byKey.get(key)?.id;

/** The keys a stored tag list stands for, unresolvable entries dropped. */
const tagKeysOf = (ids: readonly string[]): readonly string[] =>
  ids.map(id => byId.get(id)?.name).filter((key): key is string => key !== undefined);

/** The ids a draft's keys resolve to, unknown terms dropped. */
const tagIdsForKeys = (keys: readonly string[]): readonly TagId[] =>
  keys.map(key => byKey.get(key)?.id).filter((id): id is TagId => id !== undefined);

/** Whether a stored tag list carries one particular term. */
const hasTagKey = (ids: readonly string[], key: string): boolean => {
  const id = byKey.get(key)?.id;
  return id !== undefined && ids.includes(id);
};

/**
 * The same read, narrowed to the taxonomy union a rule is written against.
 *
 * The narrowing is asserted rather than proven, and deliberately so: the
 * taxonomy tables SEED the vocabulary, they do not bound it, so a term added
 * after the seed is a real key that no union mentions. Widening the unions to
 * `string` instead would cost every rule its exhaustiveness, for the sake of a
 * term that by definition matches none of them. A test pins the seeded terms to
 * the unions, which is where the guarantee actually belongs.
 */
const screenTagKeysOf = (ids: readonly string[]): readonly ScreenTag[] =>
  tagKeysOf(ids) as readonly ScreenTag[];

const connectionTagKeysOf = (ids: readonly string[]): readonly ConnectionTag[] =>
  tagKeysOf(ids) as readonly ConnectionTag[];

const checkTagKeysOf = (ids: readonly string[]): readonly ContentTag[] =>
  tagKeysOf(ids) as readonly ContentTag[];

/** Every term a collection's records may carry, in vocabulary order. */
const tagsFor = (kind: EntityKind): readonly TagRecord[] =>
  ALL_TAGS.filter(tag => tag.appliesTo.includes(kind));

/**
 * Adds a term the allocator minted after seeding, so the maps AND the registry
 * answer for it without a reload. Ignored when the id or the key is already
 * registered — a second record under either would make one of them
 * unreachable. The record is already on disk by the time this runs; this only
 * saves the session from reading a term it just created as a bare id.
 */
const registerTag = (record: TagRecord): boolean => {
  if (byId.has(record.id) || byKey.has(record.name)) return false;
  ALL_TAGS.push(record);
  byId.set(record.id, record);
  byKey.set(record.name, record);
  replaceAll('tag', ALL_TAGS);
  return true;
};

/**
 * Folds an edited record back in after the write it depends on has already
 * landed on disk, so a rename resolves everywhere in the session without a
 * reload — the same bargain `registerTag` makes for a brand-new term. The key
 * can change along with the label, so the old `byKey` entry is dropped rather
 * than left to shadow the new one.
 */
const replaceTagRecord = (record: TagRecord): boolean => {
  const existing = byId.get(record.id);
  if (!existing) return false;
  const index = ALL_TAGS.findIndex(tag => tag.id === record.id);
  if (index === -1) return false;
  ALL_TAGS[index] = record;
  byId.set(record.id, record);
  if (existing.name !== record.name) byKey.delete(existing.name);
  byKey.set(record.name, record);
  replaceAll('tag', ALL_TAGS);
  return true;
};

/**
 * Drops a term from every map, once the delete-guard's own write has already
 * removed it from disk — the sibling of `registerTag` for the other direction.
 */
const unregisterTag = (id: string): boolean => {
  const existing = byId.get(id);
  if (!existing) return false;
  const index = ALL_TAGS.findIndex(tag => tag.id === id);
  if (index >= 0) ALL_TAGS.splice(index, 1);
  byId.delete(id);
  byKey.delete(existing.name);
  replaceAll('tag', ALL_TAGS);
  return true;
};

export {
  checkTagKeysOf, connectionTagKeysOf, hasTagKey, isTagKey, registerTag, replaceTagRecord, screenTagKeysOf,
  SEPARATOR, splitTagKey, tagById, tagByKey, tagIdForKey, tagIdsForKeys, tagKey, tagKeysOf, tagsFor, unregisterTag,
};
