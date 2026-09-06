/* @layer shared-game @kind data */
/**
 * Door-kind → connection barrier tag, used by the recorder's dataset-suggestion
 * builder to flag an observed gated door that the static connection data doesn't
 * yet tag. `null` means the door kind implies no barrier tag (a normal door, or a
 * trap door the sim doesn't model as a requirement).
 */
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
