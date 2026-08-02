/* @layer tests @kind test */
/**
 * Editing a tag record's own fields has no consistency check beyond the
 * "mint a new tag from a picker" shortcut's — `create-tag.ts`'s
 * `isTagKey` gate never runs against a straight edit of an existing
 * `TagRecord`'s `namespace`/`value`/`name`. `writeTag` (`record-writers.ts`)
 * is the one save path every tag edit funnels through, so the check belongs
 * there: `name` must read `namespace:value`, matching this record's own two
 * halves, or the save is refused before it ever reaches the write channel.
 */
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
// Entering through `collection-sources.ts` (as the real app does — it is what
// every other module reaches `RECORD_WRITERS` through) rather than importing
// `record-writers.ts` directly, which would otherwise expose the two modules'
// existing circular import from the wrong side: `collection-sources.ts` builds
// its whole map eagerly at load time, and reaching it before `record-writers.ts`
// has finished its own top-level evaluation would read `RECORD_WRITERS` while
// it is still undefined.
import { COLLECTION_SOURCES } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/collection-sources';

const RECORD_WRITERS = { tag: COLLECTION_SOURCES.tag.onSave };

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
