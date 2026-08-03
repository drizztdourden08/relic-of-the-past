/* @layer tests @kind test */
/**
 * The check that actually holds the convention.
 *
 * The editor refuses an off-convention term before it sends anything, but that
 * is a courtesy — it is the writer that stands between a bad key and the file,
 * and it is the writer that has to refuse. Every case below returns before any
 * file is read or any id is allocated, which is what makes it testable without
 * a workspace and what makes it safe: a rejected term never reaches the
 * allocator, so it cannot burn a number either.
 */
import { describe, it, expect } from 'vitest';
import { allocateTag } from '../../../apps/desktop/electron/screen-editor/tag-writer';
import { splitTagKey } from '@shared/game/data';

/** A root that does not exist — reaching the filesystem at all would throw. */
const NO_ROOT = '/definitely-not-a-workspace';

const refuse = (key: string) => allocateTag(NO_ROOT, { key, appliesTo: ['screen'] });

describe('a term the writer will not file', () => {
  it('refuses a bare word with no namespace', async () => {
    await expect(refuse('outdoor')).resolves.toEqual({
      success: false,
      error: 'A tag reads namespace:value — both parts are required.',
    });
  });

  it('refuses a separator with nothing on one side', async () => {
    expect((await refuse(':outdoor')).success).toBe(false);
    expect((await refuse('env:')).success).toBe(false);
    expect((await refuse(':')).success).toBe(false);
  });

  it('refuses an empty key', async () => {
    expect((await refuse('')).success).toBe(false);
    expect((await refuse('   ')).success).toBe(false);
  });

  it('refuses a term that belongs to no collection', async () => {
    const result = await allocateTag(NO_ROOT, { key: 'env:cavern', appliesTo: [] });
    expect(result).toEqual({ success: false, error: 'A tag has to apply to at least one collection.' });
  });
});

describe('the split the writer files a term by', () => {
  it('takes the first separator, so a value may contain one', () => {
    expect(splitTagKey('env:sub:deep')).toEqual({ namespace: 'env', value: 'sub:deep' });
  });

  it('gives back nothing for anything that is not two levels', () => {
    for (const bad of ['outdoor', ':outdoor', 'env:', '', ':']) {
      expect(splitTagKey(bad), bad).toBeNull();
    }
  });
});
