/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeAreaRecord, serializeLocationRecord, areaRecordFile, locationRecordFile } from '@rotp/game-data';
import type { FileTarget, AreaRecord, LocationRecord } from '@rotp/game-data';
import type { Allocated, AllocateGeographyArgs, AllocateGeographyResult } from '@app/ipc/screen-editor-contract';
import { withAllocatedIds } from '../id-allocator';
import { insertBeforeArrayClose } from '../source-writers';

const dataFile = (root: string, name: string): string =>
  join(root, 'packages', 'game-data', 'src', 'data', 'records', name);

const fileFor = (target: FileTarget): string => target.relativePath as string;

const append = async (path: string, code: string): Promise<string | null> => {
  const content = await readFile(path, 'utf-8');
  const result = insertBeforeArrayClose(content, code);
  if (result.error) return result.error;
  await writeFile(path, result.content, 'utf-8');
  return null;
};

const allocateGeography = async (root: string, args: AllocateGeographyArgs): Promise<AllocateGeographyResult> => {
  const name = args.name.trim();
  if (!name) return { success: false, error: 'A display name is required' };

  if (args.kind === 'area') {
    return withAllocatedIds(root, 'area', 1, async ([id]) => {
      const record: AreaRecord = { id: id as AreaRecord['id'], world: args.world, name };
      const error = await append(dataFile(root, fileFor(areaRecordFile(record))), serializeAreaRecord(record));
      if (error) return { success: false, error };
      return { success: true, kind: 'area', record: record as Allocated<AreaRecord> };
    });
  }

  return withAllocatedIds(root, 'location', 1, async ([id]) => {
    const record: LocationRecord = {
      id: id as LocationRecord['id'],
      areaId: args.areaId,
      name,
    };
    const error = await append(dataFile(root, fileFor(locationRecordFile(record))), serializeLocationRecord(record));
    if (error) return { success: false, error };
    return { success: true, kind: 'location', record: record as Allocated<LocationRecord> };
  });
};

export { allocateGeography };
