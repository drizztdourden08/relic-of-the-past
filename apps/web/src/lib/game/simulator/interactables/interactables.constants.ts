/* @layer bridge-wasm @kind constants */
import type { SimDoor } from '@shared/game/simulation';
import type { SimDoorDirection } from '../../';

const DOOR_DIRS: Record<SimDoorDirection, SimDoor['direction']> = {
  north: 'n',
  south: 's',
  west: 'w',
  east: 'e',
};

const DOOR_KINDS: SimDoor['kind'][] = ['normal', 'small-key', 'big-key', 'bombable', 'shutter', 'switch', 'trap'];

export { DOOR_DIRS, DOOR_KINDS };
