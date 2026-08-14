/* @layer tests @kind test */
/**
 * The item-group writer's create path — the seven-group ceiling is gone, so
 * an eighth group now mints a real `ig-NNN` id through the allocator, the
 * same round trip `allocateTag` already proves out for its own collection.
 * Run against a throwaway workspace shaped like the real one, so the
 * allocator's file scan and the array-splice both exercise real code paths
 * without touching the committed dataset.
 */
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  allocateItemGroup, deleteItemGroup, writeItemGroup,
} from '../../../apps/desktop/electron/screen-editor/item-group-writer';

let root = '';

const ITEM_GROUPS_SEED = `/* @layer shared-game @kind data */
const ITEM_GROUP_IDS = {
  Swords: 'ig-001',
  Bottles: 'ig-002',
} as const;

const ALL_ITEM_GROUPS = [
  {
    id: ITEM_GROUP_IDS.Swords,
    label: 'Swords',
    memberIds: ['item-001', 'item-002'],
  },
  {
    id: 'ig-002',
    label: 'Bottles',
    memberIds: ['item-003'],
  },
];

export { ALL_ITEM_GROUPS, ITEM_GROUP_IDS };
`;

const sourceOf = (): Promise<string> =>
  readFile(join(root, 'shared', 'game', 'data', 'records', 'item-groups', 'item-groups.ts'), 'utf-8');

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rotp-item-groups-'));
  const path = join(root, 'shared', 'game', 'data', 'records', 'item-groups', 'item-groups.ts');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, ITEM_GROUPS_SEED, 'utf-8');
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('allocateItemGroup', () => {
  it('mints a real id past the old seven-group ceiling and appends the row', async () => {
    const result = await allocateItemGroup(root, { label: 'Gloves', memberIds: ['item-028', 'item-029'] });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('ig-003');
    const source = await sourceOf();
    expect(source).toContain("id: 'ig-003'");
    expect(source).toContain("label: 'Gloves'");
    expect(source).toContain("memberIds: ['item-028', 'item-029']");
  });

  it('refuses a blank label rather than minting an id', async () => {
    const result = await allocateItemGroup(root, { label: '   ', memberIds: [] });
    expect(result).toEqual({ success: false, error: 'An item group needs a label.' });
    expect(await sourceOf()).not.toContain('ig-003');
  });

  it('refuses a label already on file, so two groups never collide on name', async () => {
    const result = await allocateItemGroup(root, { label: 'Swords', memberIds: [] });
    expect(result.success).toBe(false);
  });
});

describe('writeItemGroup and deleteItemGroup', () => {
  it('still replaces and removes an id already on file after the create path landed', async () => {
    const created = await allocateItemGroup(root, { label: 'Gloves', memberIds: ['item-028'] });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const id = created.record.id;

    const written = await writeItemGroup(root, { groupId: id, record: { label: 'Power Gloves', memberIds: ['item-028'] } });
    expect(written).toEqual({ success: true, ids: [id] });
    expect(await sourceOf()).toContain("label: 'Power Gloves'");

    expect(await deleteItemGroup(root, { groupId: id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf()).not.toContain(`id: '${id}'`);
  });
});
