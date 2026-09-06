/* @layer shared-game @kind logic */
/**
 * Both directions of the tag relationship. Records store TagIds, but every
 * rule is written against the KEY (`barrier:small-key`), so the conversion
 * lives here and nowhere else. Built off `ALL_TAGS`, not the registry, so it
 * has no dependency on seeding order. An id or key with no record is dropped,
 * never substituted: a stand-in would make a dangling reference look like a real term.
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
 * Asserted, not proven, on purpose: the taxonomy tables SEED the vocabulary
 * and do not bound it, so a term added later is a real key no union mentions.
 * A test pins the seeded terms to the unions.
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
 * answer for it without a reload. Ignored when the id or key already exists. The record is already on disk by the time this runs.
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
 * Folds an edited record back in after its write landed on disk, so a rename
 * resolves everywhere without a reload. The key can change with the label, so
 * the old `byKey` entry is dropped instead of shadowing the new one.
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

/** Drops a term from every map once the delete-guard's write has removed it from disk. */
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
