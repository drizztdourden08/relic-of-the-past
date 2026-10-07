/* @layer renderer-widgets @kind logic */
/**
 * The renderer's ONLY source of a new area/location id.
 *
 * Nothing here derives an id: the request carries a display name and the main
 * process answers with an `Allocated<...>` record it numbered itself. The brand is
 * nominal, so a record assembled locally (from a slugified name, a hex index, or
 * anything else) is not assignable where these are expected.
 */
import type { AreaId, AreaRecord, LocationRecord } from '@shared/game/data';
import type { Allocated } from '@shared/ipc/screen-editor-contract';

type NewArea = Allocated<AreaRecord>;
type NewLocation = Allocated<LocationRecord>;

type Allocation<T> = { record: T } | { error: string };

const allocateArea = async (randomizerName: string, world: AreaRecord['world']): Promise<Allocation<NewArea>> => {
  const result = await window.api.screenEditor.allocateGeography({ kind: 'area', randomizerName, world });
  if (!result.success) return { error: result.error };
  if (result.kind !== 'area') return { error: 'Allocator answered with the wrong record kind' };
  return { record: result.record };
};

const allocateLocation = async (randomizerName: string, areaId: AreaId): Promise<Allocation<NewLocation>> => {
  const result = await window.api.screenEditor.allocateGeography({ kind: 'location', randomizerName, areaId });
  if (!result.success) return { error: result.error };
  if (result.kind !== 'location') return { error: 'Allocator answered with the wrong record kind' };
  return { record: result.record };
};

export { allocateArea, allocateLocation };
export type { Allocation, NewArea, NewLocation };
