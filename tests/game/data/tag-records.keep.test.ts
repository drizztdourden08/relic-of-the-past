/* @layer tests @kind test */
/**
 * The tag collection, and the migration that produced it.
 *
 * Two things are pinned here. First, the seed is COMPLETE and LOSSLESS: every
 * term the two taxonomy tables define has exactly one record, under the same
 * label, and every record maps back to a term. Second, every reference the
 * migrated screen and connection records now hold resolves — a dropped or
 * mistyped term would show up as a dangling id, and there are none.
 */
import { describe, it, expect } from 'vitest';
import {
  ALL_TAGS, all, CONNECTION_TAG_METADATA, CONTENT_TAG_METADATA, ENTITY_COUNTS, getTag, tagById, tagByKey,
  tagIdForKey, tagIdsForKeys, tagKey, tagKeysOf, tagsFor, TAG_METADATA,
} from '@shared/game/data';

const SEED = [
  ...TAG_METADATA.map(entry => ({ ...entry, scope: 'screen' as const })),
  ...CONNECTION_TAG_METADATA.map(entry => ({ ...entry, scope: 'connection' as const })),
  ...CONTENT_TAG_METADATA.map(entry => ({ ...entry, scope: 'check' as const })),
];

describe('the tag collection', () => {
  it('holds one record per seeded term, and nothing else', () => {
    expect(ALL_TAGS).toHaveLength(SEED.length);
    expect(ALL_TAGS).toHaveLength(ENTITY_COUNTS.tag);
  });

  it('gives every record a unique id and a unique key', () => {
    expect(new Set(ALL_TAGS.map(tag => tag.id)).size).toBe(ALL_TAGS.length);
    expect(new Set(ALL_TAGS.map(tag => tag.name)).size).toBe(ALL_TAGS.length);
  });

  it('numbers them the way every other collection is numbered', () => {
    for (const tag of ALL_TAGS) expect(tag.id).toMatch(/^tag-\d{3}$/);
  });

  it('keeps the joined key in step with the two levels it is made of', () => {
    for (const tag of ALL_TAGS) expect(tag.name, tag.id).toBe(`${tag.namespace}:${tag.value}`);
  });

  it('has a namespace and a term on every record, never a bare word', () => {
    for (const tag of ALL_TAGS) {
      expect(tag.namespace, tag.id).not.toBe('');
      expect(tag.value, tag.id).not.toBe('');
      expect(tag.namespace, tag.id).not.toContain(':');
    }
  });

  it('says which collections each term belongs on', () => {
    for (const tag of ALL_TAGS) expect(tag.appliesTo.length, tag.id).toBeGreaterThan(0);
    expect(tagsFor('screen')).toHaveLength(TAG_METADATA.length);
    expect(tagsFor('connection')).toHaveLength(CONNECTION_TAG_METADATA.length);
    expect(tagsFor('check')).toHaveLength(CONTENT_TAG_METADATA.length);
  });

  it('reaches the facade like any other kind', () => {
    expect(all('tag')).toHaveLength(ALL_TAGS.length);
    expect(getTag('tag-001').name).toBe(ALL_TAGS[0].name);
    expect(getTag('tag-999').name).toBe('(unregistered)');
  });
});

describe('the seed, term by term', () => {
  it('carries every taxonomy term across, with its label intact', () => {
    for (const entry of SEED) {
      const record = tagByKey(entry.id);
      expect(record, entry.id).toBeDefined();
      expect(record?.label, entry.id).toBe(entry.label);
      expect(record?.namespace, entry.id).toBe(entry.namespace);
      expect(record?.appliesTo, entry.id).toContain(entry.scope);
    }
  });

  it('invents nothing — every record maps back to a seeded term', () => {
    const seeded = new Set(SEED.map(entry => entry.id));
    for (const tag of ALL_TAGS) expect(seeded.has(tag.name), tag.name).toBe(true);
  });

  it('round-trips a term through its id and back', () => {
    for (const entry of SEED) {
      const id = tagIdForKey(entry.id);
      expect(id, entry.id).toBeDefined();
      expect(tagKey(id ?? ''), entry.id).toBe(entry.id);
      expect(tagById(id ?? '')?.name, entry.id).toBe(entry.id);
    }
  });

  it('round-trips a whole list, in order', () => {
    const keys = SEED.map(entry => entry.id);
    expect(tagKeysOf(tagIdsForKeys(keys))).toEqual(keys);
  });

  it('drops what it cannot resolve rather than passing it through', () => {
    expect(tagIdsForKeys(['env:outdoor', 'nonsense:nope'])).toEqual([tagIdForKey('env:outdoor')]);
    expect(tagKeysOf(['tag-001', 'tag-999'])).toEqual(['env:outdoor']);
  });
});
