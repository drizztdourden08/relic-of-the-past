/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { ALL_TAGS, CONNECTION_TAG_METADATA, CONTENT_TAG_METADATA, find, tagById, tagByKey, tagIdForKey, tagIdsForKeys, tagKey, tagKeysOf, tagsFor, TAG_METADATA } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';

const SEED = [
  ...TAG_METADATA.map(entry => ({ ...entry, scope: 'screen' as const })),
  ...CONNECTION_TAG_METADATA.map(entry => ({ ...entry, scope: 'connection' as const })),
  ...CONTENT_TAG_METADATA.map(entry => ({ ...entry, scope: 'check' as const })),
];

describeDataset('the tag collection', () => {
  it('holds one record per seeded term, and nothing else', { tags: ['critical'] }, () => {
    expect(ALL_TAGS).toHaveLength(SEED.length);
    expect(find('tag', () => true)).toHaveLength(SEED.length);
  });

  it('gives every record a unique id and a unique key', { tags: ['critical'] }, () => {
    expect(new Set(ALL_TAGS.map(tag => tag.id)).size).toBe(ALL_TAGS.length);
    expect(new Set(ALL_TAGS.map(tag => tag.name)).size).toBe(ALL_TAGS.length);
  });

  it('numbers them the way every other collection is numbered', { tags: ['critical'] }, () => {
    for (const tag of ALL_TAGS) expect(tag.id).toMatch(/^tag-\d{3}$/);
  });

  it('keeps the joined key in step with the two levels it is made of', { tags: ['critical'] }, () => {
    for (const tag of ALL_TAGS) expect(tag.name, tag.id).toBe(`${tag.namespace}:${tag.value}`);
  });

  it('has a namespace and a term on every record, never a bare word', { tags: ['critical'] }, () => {
    for (const tag of ALL_TAGS) {
      expect(tag.namespace, tag.id).not.toBe('');
      expect(tag.value, tag.id).not.toBe('');
      expect(tag.namespace, tag.id).not.toContain(':');
    }
  });

  it('says which collections each term belongs on', { tags: ['critical'] }, () => {
    for (const tag of ALL_TAGS) expect(tag.appliesTo.length, tag.id).toBeGreaterThan(0);
    expect(tagsFor('screen')).toHaveLength(TAG_METADATA.length);
    expect(tagsFor('connection')).toHaveLength(CONNECTION_TAG_METADATA.length);
    expect(tagsFor('check')).toHaveLength(CONTENT_TAG_METADATA.length);
  });
});

describeDataset('the seed, term by term', () => {
  it('carries every taxonomy term across, with its label intact', { tags: ['critical'] }, () => {
    for (const entry of SEED) {
      const record = tagByKey(entry.id);
      expect(record, entry.id).toBeDefined();
      expect(record?.label, entry.id).toBe(entry.label);
      expect(record?.namespace, entry.id).toBe(entry.namespace);
      expect(record?.appliesTo, entry.id).toContain(entry.scope);
    }
  });

  it('round-trips a term through its id and back', { tags: ['critical'] }, () => {
    for (const entry of SEED) {
      const id = tagIdForKey(entry.id);
      expect(id, entry.id).toBeDefined();
      expect(tagKey(id ?? ''), entry.id).toBe(entry.id);
      expect(tagById(id ?? '')?.name, entry.id).toBe(entry.id);
    }
  });

  it('round-trips a whole list, in order', { tags: ['critical'] }, () => {
    const keys = SEED.map(entry => entry.id);
    expect(tagKeysOf(tagIdsForKeys(keys))).toEqual(keys);
  });

  it('drops what it cannot resolve instead of passing it through', { tags: ['critical'] }, () => {
    expect(tagIdsForKeys(['env:outdoor', 'nonsense:nope'])).toEqual([tagIdForKey('env:outdoor')]);
    expect(tagKeysOf(['tag-001', 'tag-999'])).toEqual(['env:outdoor']);
  });
});
