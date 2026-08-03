/* @layer tests @kind test */
/**
 * The enumeration writer's create/update/delete round trip, run against a
 * throwaway workspace rather than the real dataset — the same "shaped like
 * the real tree" bargain `item-group-writer.test.ts` and
 * `dataset-record-writers.test.ts` make, so the allocator's file scan and the
 * array-splice both exercise real code paths.
 *
 * `allocateEnumeration`/`writeEnumeration`/`deleteEnumeration` also regenerate
 * `enumeration/generated-types.ts` from the REAL repo's `ALL_ENUMERATION` as a
 * side effect (`generate-enum-types.mjs` reads a hardcoded path, not the
 * workspace root under test) — harmless here since this test never touches
 * the real `enumeration.ts`, so that regeneration is a same-content no-op.
 */
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  allocateEnumeration, deleteEnumeration, writeEnumeration,
} from '../../../apps/desktop/electron/screen-editor/enumeration-writer';

let root = '';

const ENUMERATION_SEED = `/* @layer shared-game @kind data */
const ALL_ENUMERATION = [
  { id: 'enum-001', category: 'world', value: 'light', label: 'Light World', appliesTo: ['screen', 'area'] },
  { id: 'enum-002', category: 'world', value: 'dark', label: 'Dark World', appliesTo: ['screen', 'area'] },
];

export { ALL_ENUMERATION };
`;

const sourceOf = (): Promise<string> =>
  readFile(join(root, 'shared', 'game', 'data', 'enumeration', 'enumeration.ts'), 'utf-8');

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rotp-enumeration-'));
  const path = join(root, 'shared', 'game', 'data', 'enumeration', 'enumeration.ts');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, ENUMERATION_SEED, 'utf-8');
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('allocateEnumeration', () => {
  it('mints a real id and appends a new closed-set row', async () => {
    const result = await allocateEnumeration(root, {
      category: 'world', value: 'both', label: 'Both Worlds', appliesTo: ['screen', 'area'],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.record.id).toBe('enum-003');
    const source = await sourceOf();
    expect(source).toContain("id: 'enum-003'");
    expect(source).toContain("value: 'both'");
    expect(source).toContain("label: 'Both Worlds'");
  });

  it('refuses a blank value rather than minting an id', async () => {
    const result = await allocateEnumeration(root, { category: 'world', value: '  ', label: 'x', appliesTo: ['screen'] });
    expect(result).toEqual({ success: false, error: 'An enumeration entry needs a value.' });
  });

  it('refuses an entry with no collection to apply to', async () => {
    const result = await allocateEnumeration(root, { category: 'world', value: 'both', label: 'Both', appliesTo: [] });
    expect(result).toEqual({
      success: false,
      error: 'An enumeration entry has to apply to at least one collection.',
    });
  });

  it('refuses a category/value pair already on file, even under a different label', async () => {
    const result = await allocateEnumeration(root, {
      category: 'world', value: 'light', label: 'Somehow Different', appliesTo: ['screen'],
    });
    expect(result.success).toBe(false);
  });

  it('allows the same value under a different category, since the pair is the key', async () => {
    const result = await allocateEnumeration(root, {
      category: 'screen-status', value: 'light', label: 'Light-ish', appliesTo: ['screen'],
    });
    expect(result.success).toBe(true);
  });
});

describe('writeEnumeration and deleteEnumeration', () => {
  it('replaces and removes an entry already on file after the create path landed', async () => {
    const created = await allocateEnumeration(root, {
      category: 'world', value: 'both', label: 'Both Worlds', appliesTo: ['screen', 'area'],
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const id = created.record.id;

    const written = await writeEnumeration(root, {
      enumerationId: id,
      record: { category: 'world', value: 'both', label: 'All Worlds', appliesTo: ['screen', 'area'] },
    });
    expect(written).toEqual({ success: true, ids: [id] });
    expect(await sourceOf()).toContain("label: 'All Worlds'");

    expect(await deleteEnumeration(root, { enumerationId: id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf()).not.toContain(`id: '${id}'`);
  });
});
