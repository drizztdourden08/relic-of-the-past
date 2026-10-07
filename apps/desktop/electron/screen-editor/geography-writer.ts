/* @layer electron-main @kind logic */
/**
 * Writing an area or a location record.
 *
 * Creating one is its own channel and always has been: the caller supplies a
 * display name and nothing else, because that is all there is to a brand-new
 * area or location, and the id comes from the allocator. Rewriting and removing
 * one take the whole record, like every other record-facade collection, and go
 * through the shared engine.
 *
 * Each collection is one file per world, so the destination comes from the record's
 * own world (record-file-targets.ts). That one thing makes these two the cheapest of the six.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeAreaRecord, serializeLocationRecord } from '@shared/game/data/record-codegen';
import { areaRecordFile, locationRecordFile } from '@shared/game/data/record-file-targets';
import type { AreaId, AreaRecord, LocationRecord } from '@shared/game/data/types';
import type {
  Allocated, AllocateGeographyArgs, AllocateGeographyResult, DeleteRecordArgs, WriteRecordArgs, WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { deleteRecord, updateRecord } from './dataset-record-writer';
import type { FileTarget } from '@shared/game/data/record-file-targets';
import type { RecordWriterSpec } from './dataset-record-writer';
import { withAllocatedIds } from './id-allocator';
import { insertBeforeArrayClose } from './source-writers';

// This process IS the allocator, so it is the one place allowed to brand an id.
// Areas and locations are records, so they sit under the synced record tree.
const dataFile = (root: string, name: string): string =>
  join(root, 'shared', 'game', 'data', 'records', name);

// Both resolvers read a world off the record, so neither can come back without a path.
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
      const record: AreaRecord = { id: id as AreaRecord['id'], world: args.world, name: name };
      const error = await append(dataFile(root, fileFor(areaRecordFile(record))), serializeAreaRecord(record));
      if (error) return { success: false, error };
      return { success: true, kind: 'area', record: record as Allocated<AreaRecord> };
    });
  }

  return withAllocatedIds(root, 'location', 1, async ([id]) => {
    const record: LocationRecord = {
      id: id as LocationRecord['id'],
      areaId: args.areaId as AreaId,
      name: name,
    };
    const error = await append(dataFile(root, fileFor(locationRecordFile(record))), serializeLocationRecord(record));
    if (error) return { success: false, error };
    return { success: true, kind: 'location', record: record as Allocated<LocationRecord> };
  });
};

const AREA_SPEC: RecordWriterSpec<AreaRecord> = {
  kind: 'area',
  recordType: 'AreaRecord',
  target: record => areaRecordFile(record),
  serialize: serializeAreaRecord,
};

const LOCATION_SPEC: RecordWriterSpec<LocationRecord> = {
  kind: 'location',
  recordType: 'LocationRecord',
  target: record => locationRecordFile(record),
  serialize: serializeLocationRecord,
};

const writeAreaRecord = (root: string, args: WriteRecordArgs<AreaRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, AREA_SPEC, args.id, args.record);

const deleteArea = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, AREA_SPEC, args.id);

const writeLocationRecord = (root: string, args: WriteRecordArgs<LocationRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, LOCATION_SPEC, args.id, args.record);

const deleteLocation = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, LOCATION_SPEC, args.id);

export { allocateGeography, deleteArea, deleteLocation, writeAreaRecord, writeLocationRecord };
