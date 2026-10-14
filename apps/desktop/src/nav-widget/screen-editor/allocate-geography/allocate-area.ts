/* @layer renderer-widgets @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { AreaRecord } from '@rotp/game-data';
import type { AllocatedArea, Allocation } from '../screen-editor.type';

const allocateArea = async (name: string, world: AreaRecord['world']): Promise<Allocation<AllocatedArea>> => {
  const result = await requireHostApi().screenEditor.allocateGeography({ kind: 'area', name, world });
  if (!result.success) return { error: result.error };
  if (result.kind !== 'area') return { error: 'Allocator answered with the wrong record kind' };
  return { record: result.record };
};

export { allocateArea };
