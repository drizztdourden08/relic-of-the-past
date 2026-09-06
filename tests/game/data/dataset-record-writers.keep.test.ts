/* @layer tests @kind test */
/**
 * Create/update/delete round trip for the six record-facade collections, in a
 * throwaway workspace. The temp tree is shaped like `shared/game/data/...`
 * because the id allocator scans that shape and the path resolver refuses to
 * escape it. Every kind gets a SPLIT collection (a record in the earlier file
 * of a size-split pair), the case a canonical destination gets wrong.
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

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rotp-writers-'));

  // Items: a junk record parked in the EARLIER half of a size split, so an
  // update has to find it there instead of in the file a create would pick.
  await seed('items/junk-1.ts', arrayFile('JUNK_1', record(
    "    id: 'item-001',\n    origin: 'vanilla',\n    category: 'junk',\n    randomizerName: 'Blue Rupee',\n",
  )));
  await seed('items/junk-2.ts', arrayFile('JUNK_2', ''));

  await seed('actors/enemies-1.ts', arrayFile('ENEMIES_1', record(
    "    id: 'actor-001',\n    gameId: { spriteType: 8 },\n    kind: 'enemy',\n    vanillaName: 'Guard',\n",
  )));
  await seed('actors/enemies-4.ts', arrayFile('ENEMIES_4', ''));

  await seed('dungeons-1.ts', arrayFile('DUNGEONS_1', record(
    "    id: 'dungeon-001',\n    gameId: { palaceIndex: 0 },\n    randomizerName: 'First',\n"
    + "    fileStem: 'first',\n    roomScreenIds: [],\n",
  )));
  await seed('dungeons-2.ts', arrayFile('DUNGEONS_2', ''));

  await seed('checks/dungeons/turtle-rock.ts', arrayFile('TR', ''));

  await seed('areas.ts', arrayFile('AREAS', record(
    "    id: 'area-001',\n    world: 'light',\n    randomizerName: 'Central',\n",
  )));
  await seed('locations.ts', arrayFile('LOCATIONS', record(
    "    id: 'location-001',\n    areaId: 'area-001',\n    randomizerName: 'A Village',\n",
  )));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describeDataset('an item record', () => {
  it('creates into the canonical file for its category, with an allocated id', async () => {
    const result = await allocateItem(root, {
      record: { origin: 'vanilla', category: 'junk', randomizerName: 'Green Rupee' },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('item-002');
    expect(await sourceOf('items/junk-2.ts')).toContain("id: 'item-002'");
    // Never in the file it was NOT filed in.
    expect(await sourceOf('items/junk-1.ts')).not.toContain("id: 'item-002'");
  });

  it('updates a record living in the earlier half of a split, in place', async () => {
    const result = await writeItemRecord(root, {
      id: 'item-001',
      record: { origin: 'vanilla', category: 'junk', randomizerName: 'Red Rupee' },
    });
    expect(result).toEqual({ success: true, ids: ['item-001'] });
    const source = await sourceOf('items/junk-1.ts');
    expect(source).toContain("randomizerName: 'Red Rupee'");
    expect(source).not.toContain('Blue Rupee');
    expect(await sourceOf('items/junk-2.ts')).not.toContain("id: 'item-001'");
  });

  it('deletes a record from the file it really sits in', async () => {
    expect(await deleteItem(root, { id: 'item-001' })).toEqual({ success: true, ids: ['item-001'] });
    expect(await sourceOf('items/junk-1.ts')).not.toContain("id: 'item-001'");
  });

  it('refuses an id no file carries, instead of writing anywhere', async () => {
    const before = await sourceOf('items/junk-1.ts');
    const result = await deleteItem(root, { id: 'item-404' });
    expect(result.success).toBe(false);
    expect(await sourceOf('items/junk-1.ts')).toBe(before);
  });
});

describeDataset('an actor record', () => {
  it('creates into the last file of its kind group', async () => {
    const result = await allocateActor(root, {
      record: { gameId: { spriteType: 9 }, kind: 'enemy', vanillaName: 'Soldier' },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('actor-002');
    expect(await sourceOf('actors/enemies-4.ts')).toContain("id: 'actor-002'");
  });

  it('updates and deletes one that sits in an earlier file of the group', async () => {
    await writeActorRecord(root, {
      id: 'actor-001',
      record: { gameId: { spriteType: 8 }, kind: 'enemy', vanillaName: 'Sentry' },
    });
    expect(await sourceOf('actors/enemies-1.ts')).toContain("vanillaName: 'Sentry'");
    await deleteActor(root, { id: 'actor-001' });
    expect(await sourceOf('actors/enemies-1.ts')).not.toContain("id: 'actor-001'");
  });
});

describeDataset('a dungeon record', () => {
  it('creates into the second file and edits one held by the first', async () => {
    const created = await allocateDungeon(root, {
      record: { gameId: { palaceIndex: 4 }, randomizerName: 'Second', fileStem: 'second', roomScreenIds: [] },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.record.id).toBe('dungeon-002');
    expect(await sourceOf('dungeons-2.ts')).toContain("id: 'dungeon-002'");

    await writeDungeonRecord(root, {
      id: 'dungeon-001',
      record: { gameId: { palaceIndex: 0 }, randomizerName: 'Renamed', fileStem: 'first', roomScreenIds: [] },
    });
    expect(await sourceOf('dungeons-1.ts')).toContain("randomizerName: 'Renamed'");

    await deleteDungeon(root, { id: 'dungeon-001' });
    expect(await sourceOf('dungeons-1.ts')).not.toContain("id: 'dungeon-001'");
  });
});

describeDataset('a check record', () => {
  const draft = {
    gameId: { roomId: 0xd6, chestIndex: 0 },
    kind: 'chest' as const,
    dungeonId: 'dungeon-012' as const,
    randomizerName: 'A Chest',
    vanillaItemIds: [],
  };

  it('creates into the file its dungeon owns', async () => {
    const result = await allocateCheck(root, { record: draft });
    expect(result.success ? '' : result.error).toBe('');
    if (!result.success) return;
    expect(await sourceOf('checks/dungeons/turtle-rock.ts')).toContain(`id: '${result.record.id}'`);
  });

  it('round-trips an update and a delete through the file it was created in', async () => {
    const created = await allocateCheck(root, { record: draft });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const id = created.record.id;

    expect(await writeCheckRecord(root, { id, record: { ...draft, randomizerName: 'Renamed Chest' } }))
      .toEqual({ success: true, ids: [id] });
    expect(await sourceOf('checks/dungeons/turtle-rock.ts')).toContain("randomizerName: 'Renamed Chest'");

    expect(await deleteCheck(root, { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('checks/dungeons/turtle-rock.ts')).not.toContain(`id: '${id}'`);
  });

  it('refuses a check with no destination instead of picking one', async () => {
    const result = await allocateCheck(root, {
      record: { gameId: {}, kind: 'event', randomizerName: 'Nowhere', vanillaItemIds: [] },
    });
    expect(result.success).toBe(false);
  });
});

describeDataset('geography records', () => {
  it('round-trips an area through create, update and delete', async () => {
    const created = await allocateGeography(root, { kind: 'area', randomizerName: 'New Land', world: 'dark' });
    expect(created.success).toBe(true);
    if (!created.success || created.kind !== 'area') return;
    const id = created.record.id;
    expect(await sourceOf('areas.ts')).toContain(`id: '${id}'`);

    await writeAreaRecord(root, { id, record: { world: 'dark', randomizerName: 'Renamed Land' } });
    expect(await sourceOf('areas.ts')).toContain("randomizerName: 'Renamed Land'");

    expect(await deleteArea(root, { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('areas.ts')).not.toContain(`id: '${id}'`);
  });

  it('round-trips a location through create, update and delete', async () => {
    const created = await allocateGeography(root, { kind: 'location', randomizerName: 'A Shop', areaId: 'area-001' });
    expect(created.success).toBe(true);
    if (!created.success || created.kind !== 'location') return;
    const id = created.record.id;

    await writeLocationRecord(root, { id, record: { areaId: 'area-001', randomizerName: 'The Shop' } });
    expect(await sourceOf('locations.ts')).toContain("randomizerName: 'The Shop'");

    expect(await deleteLocation(root, { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('locations.ts')).not.toContain(`id: '${id}'`);
  });
});
