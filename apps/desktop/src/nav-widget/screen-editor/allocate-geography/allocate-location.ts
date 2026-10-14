/* @layer renderer-widgets @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { AreaId } from '@rotp/game-data';
import type { AllocatedLocation, Allocation } from '../screen-editor.type';

const allocateLocation = async (name: string, areaId: AreaId): Promise<Allocation<AllocatedLocation>> => {
  const result = await requireHostApi().screenEditor.allocateGeography({ kind: 'location', name, areaId });
  if (!result.success) return { error: result.error };
  if (result.kind !== 'location') return { error: 'Allocator answered with the wrong record kind' };
  return { record: result.record };
};

export { allocateLocation };
