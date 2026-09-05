/* @layer tests @kind test */
/**
 * `create-tag.ts`'s `isTagKey` gate never runs against a straight edit of a
 * `TagRecord`. `writeTag` (`record-writers.ts`) is the one save path every tag
 * edit goes through, so the check lives there: `name` must read
 * `namespace:value`, or the save is refused before the write channel.
 */
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { RECORD_WRITERS } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-writers';

const baseTag = {
  id: 'tag-999',
  name: 'env:outdoor',
  namespace: 'env',
  value: 'outdoor',
  label: 'Outdoor',
  namespaceLabel: 'Environment',
  appliesTo: ['screen'],
};

const writeTag = (): NonNullable<typeof RECORD_WRITERS.tag> => {
  const writer = RECORD_WRITERS.tag;
  if (!writer) throw new Error('no writer registered for tag');
  return writer;
};

describe('writeTag enforces the namespace:value convention on every edit', () => {
  let writeTagApi: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTagApi = vi.fn().mockResolvedValue({ success: true, ids: ['tag-999'] });
    vi.stubGlobal('window', { api: { screenEditor: { writeTag: writeTagApi } } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects a value edit that leaves name out of step with namespace:value', async () => {
    const mismatched = { ...baseTag, value: 'indoor' };
    await expect(writeTag()(mismatched)).rejects.toThrow(/namespace:value/);
    expect(writeTagApi).not.toHaveBeenCalled();
  });

  it('rejects a namespace edit that leaves name out of step with namespace:value', async () => {
    const mismatched = { ...baseTag, namespace: 'terrain' };
    await expect(writeTag()(mismatched)).rejects.toThrow(/namespace:value/);
    expect(writeTagApi).not.toHaveBeenCalled();
  });

  it('rejects a name with no separator at all, even if it matches neither half', async () => {
    const mismatched = { ...baseTag, name: 'env-outdoor' };
    await expect(writeTag()(mismatched)).rejects.toThrow(/namespace:value/);
    expect(writeTagApi).not.toHaveBeenCalled();
  });

  it('accepts a consistent edit and reaches the write channel', async () => {
    await writeTag()(baseTag);
    expect(writeTagApi).toHaveBeenCalledWith({
      tagId: 'tag-999',
      record: expect.objectContaining({ name: 'env:outdoor', namespace: 'env', value: 'outdoor' }),
    });
  });
});
