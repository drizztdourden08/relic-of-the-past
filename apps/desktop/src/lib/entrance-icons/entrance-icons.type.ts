/* @layer renderer-lib @kind types */
type EntranceType = 'door' | 'cave' | 'hole' | 'well' | 'dungeon' | 'fairy' | 'shop' | 'house' | 'overworld' | 'respawn' | 'unknown';

interface IconData { body: string; width?: number; height?: number; }

export type { EntranceType, IconData };
