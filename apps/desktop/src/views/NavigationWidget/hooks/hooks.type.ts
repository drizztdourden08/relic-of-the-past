/* @layer renderer-widgets @kind types */
interface FloodOnTransitionOptions {
  enabled: boolean;
  isIndoors: boolean;
  linkX: number;
  linkY: number;
  onTrigger: () => void;
}

interface PlayerDebugState {
  playerX: number;
  playerY: number;
  relX: number;
  relY: number;
  tileMinCol: number;
  tileMaxCol: number;
  tileMinRow: number;
  tileMaxRow: number;
  map16Row: number;
  map16Col: number;
  liveScreenIndex: number;
  playerLayer: number | null;
  collisionType: number | null;
  staircaseType: number | null;
  inDoorway: number;
  doorAnimStep: number;
}

export type { FloodOnTransitionOptions, PlayerDebugState };
