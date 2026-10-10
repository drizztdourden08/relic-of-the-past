/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { allocateActor, deleteActor, writeActorRecord } from '../../../../electron/screen-editor/actor-writer';
import { allocateItem, deleteItem, writeItemRecord } from '../../../../electron/screen-editor/item-writer';
import { describeDataset } from '../../../dataset-guard';
import { setUpWriterWorkspace } from './set-up-writer-workspace';

const { root, sourceOf } = setUpWriterWorkspace();

describeDataset('an item record', () => {
  it('creates into the canonical file for its category, with an allocated id', async () => {
    const result = await allocateItem(root(), {
      record: { origin: 'vanilla', category: 'junk', name: 'Green Rupee' },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('item-002');
    expect(await sourceOf('items/junk.ts')).toContain("id: 'item-002'");
    expect(await sourceOf('items/randomizer.ts')).not.toContain("id: 'item-002'");
  });

  it('updates a record living somewhere a create would not have put it, in place', async () => {
    const result = await writeItemRecord(root(), {
      id: 'item-001',
      record: { origin: 'vanilla', category: 'junk', name: 'Red Rupee' },
    });
    expect(result).toEqual({ success: true, ids: ['item-001'] });
    const source = await sourceOf('items/randomizer.ts');
    expect(source).toContain("name: 'Red Rupee'");
    expect(source).not.toContain('Blue Rupee');
    expect(await sourceOf('items/junk.ts')).not.toContain("id: 'item-001'");
  });

  it('deletes a record from the file it really sits in', async () => {
    expect(await deleteItem(root(), { id: 'item-001' })).toEqual({ success: true, ids: ['item-001'] });
    expect(await sourceOf('items/randomizer.ts')).not.toContain("id: 'item-001'");
  });

  it('refuses an id no file carries, instead of writing anywhere', async () => {
    const before = await sourceOf('items/randomizer.ts');
    const result = await deleteItem(root(), { id: 'item-404' });
    expect(result.success).toBe(false);
    expect(await sourceOf('items/randomizer.ts')).toBe(before);
  });
});

describeDataset('an actor record', () => {
  it('creates into the file its kind owns', async () => {
    const result = await allocateActor(root(), {
      record: { gameId: { spriteType: 9 }, kind: 'enemy', name: 'Soldier' },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('actor-002');
    expect(await sourceOf('actors/enemies.ts')).toContain("id: 'actor-002'");
  });

  it('updates and deletes one that sits in another file of the collection', async () => {
    await writeActorRecord(root(), {
      id: 'actor-001',
      record: { gameId: { spriteType: 8 }, kind: 'enemy', name: 'Sentry' },
    });
    expect(await sourceOf('actors/bosses.ts')).toContain("name: 'Sentry'");
    await deleteActor(root(), { id: 'actor-001' });
    expect(await sourceOf('actors/bosses.ts')).not.toContain("id: 'actor-001'");
  });
});
