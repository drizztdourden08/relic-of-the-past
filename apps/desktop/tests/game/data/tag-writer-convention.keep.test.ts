/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { allocateTag } from '../../../electron/screen-editor/tag-writer';
import { splitTagKey } from '@rotp/game-data';

const NO_ROOT = '/definitely-not-a-workspace';

const refuse = (key: string) => allocateTag(NO_ROOT, { key, appliesTo: ['screen'] });

describe('a term the writer will not file', () => {
  it('refuses a bare word with no namespace', { tags: ['critical'] }, async () => {
    await expect(refuse('outdoor')).resolves.toEqual({
      success: false,
      error: 'A tag reads namespace:value. Both parts are required.',
    });
  });

  it('refuses a separator with nothing on one side', { tags: ['critical'] }, async () => {
    expect((await refuse(':outdoor')).success).toBe(false);
    expect((await refuse('env:')).success).toBe(false);
    expect((await refuse(':')).success).toBe(false);
  });

  it('refuses an empty key', { tags: ['critical'] }, async () => {
    expect((await refuse('')).success).toBe(false);
    expect((await refuse('   ')).success).toBe(false);
  });

  it('refuses a term that belongs to no collection', { tags: ['critical'] }, async () => {
    const result = await allocateTag(NO_ROOT, { key: 'env:cavern', appliesTo: [] });
    expect(result).toEqual({ success: false, error: 'A tag has to apply to at least one collection.' });
  });
});

describe('the split the writer files a term by', () => {
  it('takes the first separator, so a value may contain one', { tags: ['critical'] }, () => {
    expect(splitTagKey('env:sub:deep')).toEqual({ namespace: 'env', value: 'sub:deep' });
  });

  it('gives back nothing for anything that is not two levels', { tags: ['critical'] }, () => {
    for (const bad of ['outdoor', ':outdoor', 'env:', '', ':']) {
      expect(splitTagKey(bad), bad).toBeNull();
    }
  });
});
