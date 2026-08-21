/* @layer shared-asset-extraction @kind data */
interface DungeonDestination {
  roomId: number;
  quadrant: number;
}

interface DungeonRoomHeader {
  bg2: number;
  collision: number;
  lightsOut: boolean;
  palette: number;
  blockset: number;
  enemyBlockset: number;
  effect: number;
  tags: readonly [number, number];
  hole: DungeonDestination;
  stairs: readonly DungeonDestination[];
  nativeBytes: Buffer;
}

interface DungeonEntityRecord {
  kind: 'entity' | 'overlord' | 'death-marker';
  x: number;
  y: number;
  floor: number;
  subtype: number;
  type: number;
  action?: number;
  nativeBytes: Buffer;
}

interface DungeonSecretRecord {
  x: number;
  y: number;
  type: number;
  nativeBytes: Buffer;
}

interface NativeDungeonLayer {
  width: 64;
  height: 64;
  gbaWords: Uint16Array;
  snesWords: Uint16Array;
  collision: Uint8Array;
  sourceAddress: number;
}

interface DungeonRoomRecord {
  id: number;
  header: DungeonRoomHeader;
  layers: readonly NativeDungeonLayer[];
  entitySortMode: number;
  entities: readonly DungeonEntityRecord[];
  secrets: readonly DungeonSecretRecord[];
  provenance: Record<string, number | string | readonly number[]>;
}

interface DungeonTopologyEdge {
  fromRoomId: number;
  kind: 'hole' | 'stair';
  slot: number;
  toRoomId: number;
  quadrant: number;
  insidePalace: boolean;
}

type DungeonInteractionKind = 'deep-water' | 'shallow-water' | 'pit' | 'stair' | 'conveyor-up' |
  'conveyor-down' | 'conveyor-left' | 'conveyor-right';

interface DungeonInteractionCell {
  roomId: number;
  layer: number;
  x: number;
  y: number;
  attribute: number;
  kind: DungeonInteractionKind;
}

export type {
  DungeonDestination,
  DungeonEntityRecord,
  DungeonRoomHeader,
  DungeonInteractionCell,
  DungeonInteractionKind,
  DungeonRoomRecord,
  DungeonSecretRecord,
  DungeonTopologyEdge,
  NativeDungeonLayer,
};
