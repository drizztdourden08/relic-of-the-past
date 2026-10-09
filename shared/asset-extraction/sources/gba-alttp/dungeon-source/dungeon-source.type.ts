/* @layer shared-asset-extraction @kind types */
interface TopologyDestination {
  kind: 'hole' | 'stair';
  slot: number;
  value: { roomId: number; quadrant: number };
}

export type { TopologyDestination };
