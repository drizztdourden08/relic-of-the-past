/* @layer tests @kind test */
import { expect, it } from 'vitest';
import {
  allocateGeography, deleteArea, deleteLocation, writeAreaRecord, writeLocationRecord,
} from '../../../../electron/screen-editor/geography-writer';
import { describeDataset } from '../../../dataset-guard';
import { setUpWriterWorkspace } from './set-up-writer-workspace';

const { root, sourceOf } = setUpWriterWorkspace();

describeDataset('geography records', () => {
  it('round-trips an area through create, update and delete', async () => {
    const created = await allocateGeography(root(), { kind: 'area', name: 'New Land', world: 'dark' });
    expect(created.success).toBe(true);
    if (!created.success || created.kind !== 'area') return;
    const id = created.record.id;
    expect(await sourceOf('areas/dark-world.ts')).toContain(`id: '${id}'`);

    await writeAreaRecord(root(), { id, record: { world: 'dark', name: 'Renamed Land' } });
    expect(await sourceOf('areas/dark-world.ts')).toContain("name: 'Renamed Land'");

    expect(await deleteArea(root(), { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('areas/dark-world.ts')).not.toContain(`id: '${id}'`);
  });

  it('round-trips a location through create, update and delete', async () => {
    const created = await allocateGeography(root(), { kind: 'location', name: 'A Shop', areaId: 'area-001' });
    expect(created.success).toBe(true);
    if (!created.success || created.kind !== 'location') return;
    const id = created.record.id;

    await writeLocationRecord(root(), { id, record: { areaId: 'area-001', name: 'The Shop' } });
    expect(await sourceOf('locations/light-world.ts')).toContain("name: 'The Shop'");

    expect(await deleteLocation(root(), { id })).toEqual({ success: true, ids: [id] });
    expect(await sourceOf('locations/light-world.ts')).not.toContain(`id: '${id}'`);
  });
});
