/* @layer electron-main @kind logic */
/**
 * Appends a new area or location record to its dataset file.
 *
 * The caller supplies a display name and nothing else: the id comes from the
 * allocator and the record text comes from the dataset's own emitter, so neither
 * a name-derived id nor a stale record shape can reach disk from here.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeAreaRecord, serializeLocationRecord } from '@shared/game/data/record-codegen';
import type { AreaId, AreaRecord, LocationRecord } from '@shared/game/data/types';
import type {
  Allocated, AllocateGeographyArgs, AllocateGeographyResult,
} from '@shared/ipc/screen-editor-contract';
import { withAllocatedIds } from './id-allocator';
import { insertBeforeArrayClose } from './source-writers';

// This process IS the allocator, so it is the one place allowed to brand an id.
const dataFile = (root: string, name: string): string =>
  join(root, 'shared', 'game', 'data', name);

const append = async (path: string, code: string): Promise<string | null> => {
  const content = await readFile(path, 'utf-8');
  const result = insertBeforeArrayClose(content, code);
  if (result.error) return result.error;
  await writeFile(path, result.content, 'utf-8');
  return null;
};

const allocateGeography = async (root: string, args: AllocateGeographyArgs): Promise<AllocateGeographyResult> => {
  const name = args.randomizerName.trim();
  if (!name) return { success: false, error: 'A display name is required' };

  if (args.kind === 'area') {
    return withAllocatedIds(root, 'area', 1, async ([id]) => {
      const record: AreaRecord = { id: id as AreaRecord['id'], world: args.world, randomizerName: name };
      const error = await append(dataFile(root, 'areas.ts'), serializeAreaRecord(record));
      if (error) return { success: false, error };
      return { success: true, kind: 'area', record: record as Allocated<AreaRecord> };
    });
  }

  return withAllocatedIds(root, 'location', 1, async ([id]) => {
    const record: LocationRecord = {
      id: id as LocationRecord['id'],
      areaId: args.areaId as AreaId,
      randomizerName: name,
    };
    const error = await append(dataFile(root, 'locations.ts'), serializeLocationRecord(record));
    if (error) return { success: false, error };
    return { success: true, kind: 'location', record: record as Allocated<LocationRecord> };
  });
};

export { allocateGeography };
