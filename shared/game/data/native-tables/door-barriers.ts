/* @layer shared-game @kind data */
/**
 * Door-kind → connection barrier tag, used by the recorder's dataset-suggestion
 * builder to flag an observed gated door that the static connection data doesn't
 * yet tag. `null` means the door kind implies no barrier tag (a normal door, or a
 * trap door the sim doesn't model as a requirement).
 */

/** Mirrors `SimDoor['kind']` (shared/game/simulation/types.ts) without importing the engine type. */
type DoorKind = 'normal' | 'small-key' | 'big-key' | 'bombable' | 'shutter' | 'switch' | 'trap';

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
