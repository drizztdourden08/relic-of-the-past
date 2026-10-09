/* @layer shared-game @kind data */
import type { DoorKind } from '../../types/native-tables';

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
