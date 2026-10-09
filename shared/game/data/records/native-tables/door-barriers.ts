/* @layer shared-game @kind data */
import type { DoorKind } from '@shared/game/data/types/native-tables';

const DOOR_BARRIER: Record<DoorKind, string | null> = {
  normal: null,
  'small-key': 'barrier:small-key',
  'big-key': 'barrier:big-key',
  bombable: 'barrier:bomb',
  shutter: 'barrier:event',
  switch: 'barrier:event',
  trap: null,
};

export { DOOR_BARRIER };
