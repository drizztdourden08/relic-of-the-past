/* @layer shared-game @kind types */
interface CliffDir {
  dr: number;
  dc: number;
  dir: 'n' | 's' | 'e' | 'w';
}

type DoorKind = 'normal' | 'small-key' | 'big-key' | 'bombable' | 'shutter' | 'switch' | 'trap';

export type { CliffDir, DoorKind };
