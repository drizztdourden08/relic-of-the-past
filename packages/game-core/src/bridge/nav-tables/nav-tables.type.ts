/* @layer bridge-wasm @kind types */
interface OverworldEntrance {
  area: number;
  pos: number;
  id: number;
}

interface FallHole {
  area: number;
  pos: number;
  entranceId: number;
}

type EntranceSpawn = { x: number; y: number; startingLayer: number };

export type { OverworldEntrance, FallHole, EntranceSpawn };
