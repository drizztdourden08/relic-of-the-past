/* @layer tests @kind test */
/**
 * Create/update/delete round trip for the six record-facade collections, in a
 * throwaway workspace. The temp tree is shaped like `shared/game/data/...`
 * because the id allocator scans that shape and the path resolver refuses to
 * escape it.
 *
 * The fixture parks one record in a file its own resolver would NOT name. Nothing
 * in the committed tree does that, and tree-layout.keep.test.ts forbids it there;
 * here it is the probe: an update or a delete must find a record by id, wherever
 * it sits, instead of assuming the file a create would have picked.
 */
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { allocateActor, deleteActor, writeActorRecord } from '../../../apps/desktop/electron/screen-editor/actor-writer';
import { allocateCheck, deleteCheck, writeCheckRecord } from '../../../apps/desktop/electron/screen-editor/check-writer';
import { allocateDungeon, deleteDungeon, writeDungeonRecord } from '../../../apps/desktop/electron/screen-editor/dungeon-writer';
import { allocateItem, deleteItem, writeItemRecord } from '../../../apps/desktop/electron/screen-editor/item-writer';
import {
  allocateGeography, deleteArea, deleteLocation, writeAreaRecord, writeLocationRecord,
} from '../../../apps/desktop/electron/screen-editor/geography-writer';
import { describeDataset } from '../../dataset-guard';

let root = '';

/** One array-literal source file, in the same shape the committed ones have. */
const arrayFile = (name: string, body: string): string =>
  `/* @layer shared-game @kind data */\nconst ${name} = [\n${body}];\n\nexport { ${name} };\n`;

const record = (fields: string): string => `  {\n${fields}  },\n`;

const seed = async (relativePath: string, contents: string): Promise<void> => {
  const path = join(root, 'shared', 'game', 'data', 'records', relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, 'utf-8');
};

const sourceOf = (relativePath: string): Promise<string> =>
  readFile(join(root, 'shared', 'game', 'data', 'records', relativePath), 'utf-8');

/**
 * The records a written file really holds, by evaluating its array literal. The
 * emitter's output is plain data, so reading it back this way is the round trip a
 * reader would get, without a loader for a file in a temp tree.
 */
const recordsIn = (source: string): Record<string, unknown>[] => {
  const body = source.slice(source.indexOf('= [') + 2, source.lastIndexOf('];') + 1);
  return new Function(`return ${body};`)() as Record<string, unknown>[];
};

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rotp-writers-'));

  // A vanilla junk record parked with the seed-only items, which is not where a
  // create for it would land.
  await seed('items/randomizer.ts', arrayFile('RANDOMIZER', record(
    "    id: 'item-001',\n    origin: 'vanilla',\n    category: 'junk',\n    name: 'Blue Rupee',\n",
  )));
  await seed('items/junk.ts', arrayFile('JUNK', ''));

  // An enemy parked with the bosses, for the same reason.
  await seed('actors/bosses.ts', arrayFile('BOSSES', record(
    "    id: 'actor-001',\n    gameId: { spriteType: 8 },\n    kind: 'enemy',\n    name: 'Guard',\n",
  )));
  await seed('actors/enemies.ts', arrayFile('ENEMIES', ''));

  await seed('dungeons/light-world/first.ts', arrayFile('FIRST', record(
    "    id: 'dungeon-001',\n    gameId: { palaceIndex: 0 },\n    name: 'First',\n"
    + "    fileStem: 'first',\n    roomScreenIds: [],\n",
  )));

  await seed('checks/dark-world/turtle-rock.ts', arrayFile('TR', ''));

  await seed('areas/light-world.ts', arrayFile('LIGHT_AREAS', record(
    "    id: 'area-001',\n    world: 'light',\n    name: 'Central',\n",
  )));
  await seed('areas/dark-world.ts', arrayFile('DARK_AREAS', ''));
  await seed('locations/light-world.ts', arrayFile('LIGHT_LOCATIONS', record(
    "    id: 'location-001',\n    areaId: 'area-001',\n    name: 'A Village',\n",
  )));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describeDataset('an item record', () => {
  it('creates into the canonical file for its category, with an allocated id', async () => {
    const result = await allocateItem(root, {
      record: { origin: 'vanilla', category: 'junk', name: 'Green Rupee' },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('item-002');
    expect(await sourceOf('items/junk.ts')).toContain("id: 'item-002'");
    // Never in the file it was NOT filed in.
    expect(await sourceOf('items/randomizer.ts')).not.toContain("id: 'item-002'");
  });

  it('updates a record living somewhere a create would not have put it, in place', async () => {
    const result = await writeItemRecord(root, {
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
    expect(await deleteItem(root, { id: 'item-001' })).toEqual({ success: true, ids: ['item-001'] });
    expect(await sourceOf('items/randomizer.ts')).not.toContain("id: 'item-001'");
  });

  it('refuses an id no file carries, instead of writing anywhere', async () => {
    const before = await sourceOf('items/randomizer.ts');
    const result = await deleteItem(root, { id: 'item-404' });
    expect(result.success).toBe(false);
    expect(await sourceOf('items/randomizer.ts')).toBe(before);
  });
});

describeDataset('an actor record', () => {
  it('creates into the file its kind owns', async () => {
    const result = await allocateActor(root, {
      record: { gameId: { spriteType: 9 }, kind: 'enemy', name: 'Soldier' },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('actor-002');
    expect(await sourceOf('actors/enemies.ts')).toContain("id: 'actor-002'");
  });

  it('updates and deletes one that sits in another file of the collection', async () => {
    await writeActorRecord(root, {
      id: 'actor-001',
      record: { gameId: { spriteType: 8 }, kind: 'enemy', name: 'Sentry' },
    });
    expect(await sourceOf('actors/bosses.ts')).toContain("name: 'Sentry'");
    await deleteActor(root, { id: 'actor-001' });
    expect(await sourceOf('actors/bosses.ts')).not.toContain("id: 'actor-001'");
  });
});

describeDataset('a dungeon record', () => {
  it('creates into its own file and edits the one already there', async () => {
    const created = await allocateDungeon(root, {
      record: { gameId: { palaceIndex: 4 }, name: 'Second', fileStem: 'second', roomScreenIds: [] },
    });
    expect(created.success ? '' : created.error).toBe('');
    if (!created.success) return;
    expect(created.record.id).toBe('dungeon-002');
    expect(await sourceOf('dungeons/light-world/second.ts')).toContain("id: 'dungeon-002'");

    await writeDungeonRecord(root, {
      id: 'dungeon-001',
      record: { gameId: { palaceIndex: 0 }, name: 'Renamed', fileStem: 'first', roomScreenIds: [] },
    });
    expect(await sourceOf('dungeons/light-world/first.ts')).toContain("name: 'Renamed'");

    await deleteDungeon(root, { id: 'dungeon-001' });
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
    const result = await allocateCheck(root, { record: draft });
    expect(result.success ? '' : result.error).toBe('');
    if (!result.success) return;
    expect(await sourceOf('checks/dark-world/turtle-rock.ts')).toContain(`id: '${result.record.id}'`);
  });

  it('round-trips an update and a delete through the file it was created in', async () => {
    const created = await allocateCheck(root, { record: draft });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const id = created.record.id;

    expect(await writeCheckRecord(root, { id, record: { ...draft, name: 'Renamed Chest' } }))
      .toEqual({ success: true, ids: [id] });
    expect(await sourceOf('checks/dark-world/turtle-rock.ts')).toContain("name: 'Renamed Chest'");

    expect(await deleteCheck(root, { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('checks/dark-world/turtle-rock.ts')).not.toContain(`id: '${id}'`);
  });

  it('writes a review mark into the record file, last, and reads it back unchanged', async () => {
    const review = {
      status: 'needs-work' as const,
      source: 'person' as const,
      note: 'the standing mask is unverified',
      at: '2026-09-23T00:00:00.000Z',
    };
    const created = await allocateCheck(root, { record: { ...draft, review } });
    expect(created.success ? '' : created.error).toBe('');
    if (!created.success) return;

    const [written] = recordsIn(await sourceOf('checks/dark-world/turtle-rock.ts'));
    expect(written).toEqual({ id: created.record.id, ...draft, review });
    expect(Object.keys(written).at(-1)).toBe('review');
  });

  it('refuses a check with no destination instead of picking one', async () => {
    const result = await allocateCheck(root, {
      record: { gameId: {}, kind: 'event', name: 'Nowhere', vanillaItemIds: [] },
    });
    expect(result.success).toBe(false);
  });
});

describeDataset('geography records', () => {
  it('round-trips an area through create, update and delete', async () => {
    const created = await allocateGeography(root, { kind: 'area', name: 'New Land', world: 'dark' });
    expect(created.success).toBe(true);
    if (!created.success || created.kind !== 'area') return;
    const id = created.record.id;
    expect(await sourceOf('areas/dark-world.ts')).toContain(`id: '${id}'`);

    await writeAreaRecord(root, { id, record: { world: 'dark', name: 'Renamed Land' } });
    expect(await sourceOf('areas/dark-world.ts')).toContain("name: 'Renamed Land'");

    expect(await deleteArea(root, { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('areas/dark-world.ts')).not.toContain(`id: '${id}'`);
  });

  it('round-trips a location through create, update and delete', async () => {
    const created = await allocateGeography(root, { kind: 'location', name: 'A Shop', areaId: 'area-001' });
    expect(created.success).toBe(true);
    if (!created.success || created.kind !== 'location') return;
    const id = created.record.id;

    await writeLocationRecord(root, { id, record: { areaId: 'area-001', name: 'The Shop' } });
    expect(await sourceOf('locations/light-world.ts')).toContain("name: 'The Shop'");

    expect(await deleteLocation(root, { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('locations/light-world.ts')).not.toContain(`id: '${id}'`);
  });
});
