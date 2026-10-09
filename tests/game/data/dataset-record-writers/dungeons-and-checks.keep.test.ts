/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { allocateCheck, deleteCheck, writeCheckRecord } from '../../../../apps/desktop/electron/screen-editor/check-writer';
import { allocateDungeon, deleteDungeon, writeDungeonRecord } from '../../../../apps/desktop/electron/screen-editor/dungeon-writer';
import { describeDataset } from '../../../dataset-guard';
import { recordsIn } from './records-in';
import { setUpWriterWorkspace } from './set-up-writer-workspace';

const { root, sourceOf } = setUpWriterWorkspace();

describeDataset('a dungeon record', () => {
  it('creates into its own file and edits the one already there', async () => {
    const created = await allocateDungeon(root(), {
      record: { gameId: { palaceIndex: 4 }, name: 'Second', fileStem: 'second', roomScreenIds: [] },
    });
    expect(created.success ? '' : created.error).toBe('');
    if (!created.success) return;
    expect(created.record.id).toBe('dungeon-002');
    expect(await sourceOf('dungeons/light-world/second.ts')).toContain("id: 'dungeon-002'");

    await writeDungeonRecord(root(), {
      id: 'dungeon-001',
      record: { gameId: { palaceIndex: 0 }, name: 'Renamed', fileStem: 'first', roomScreenIds: [] },
    });
    expect(await sourceOf('dungeons/light-world/first.ts')).toContain("name: 'Renamed'");

    await deleteDungeon(root(), { id: 'dungeon-001' });
    expect(await sourceOf('dungeons/light-world/first.ts')).not.toContain("id: 'dungeon-001'");
  });
});

describeDataset('a check record', () => {
  const draft = {
    gameId: { roomId: 0xd6, chestIndex: 0 },
    kind: 'chest' as const,
    dungeonId: 'dungeon-012' as const,
    name: 'A Chest',
    vanillaItemIds: [],
  };

  it('creates into the file its dungeon owns', async () => {
    const result = await allocateCheck(root(), { record: draft });
    expect(result.success ? '' : result.error).toBe('');
    if (!result.success) return;
    expect(await sourceOf('checks/dark-world/turtle-rock.ts')).toContain(`id: '${result.record.id}'`);
  });

  it('round-trips an update and a delete through the file it was created in', async () => {
    const created = await allocateCheck(root(), { record: draft });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const id = created.record.id;

    expect(await writeCheckRecord(root(), { id, record: { ...draft, name: 'Renamed Chest' } }))
      .toEqual({ success: true, ids: [id] });
    expect(await sourceOf('checks/dark-world/turtle-rock.ts')).toContain("name: 'Renamed Chest'");

    expect(await deleteCheck(root(), { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('checks/dark-world/turtle-rock.ts')).not.toContain(`id: '${id}'`);
  });

  it('writes a review mark into the record file, last, and reads it back unchanged', async () => {
    const review = {
      status: 'needs-work' as const,
      source: 'person' as const,
      note: 'the standing mask is unverified',
      at: '2026-09-23T00:00:00.000Z',
    };
    const created = await allocateCheck(root(), { record: { ...draft, review } });
    expect(created.success ? '' : created.error).toBe('');
    if (!created.success) return;

    const [written] = recordsIn(await sourceOf('checks/dark-world/turtle-rock.ts'));
    expect(written).toEqual({ id: created.record.id, ...draft, review });
    expect(Object.keys(written).at(-1)).toBe('review');
  });

  it('refuses a check with no destination instead of picking one', async () => {
    const result = await allocateCheck(root(), {
      record: { gameId: {}, kind: 'event', name: 'Nowhere', vanillaItemIds: [] },
    });
    expect(result.success).toBe(false);
  });
});
