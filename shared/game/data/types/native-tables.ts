/* @layer shared-game @kind types */
/**
 * Shapes the native tile tables are written in.
 *
 * The tables themselves are transcribed from the original engine and live in the
 * private companion repo, but their shapes stay here: a type is erased at
 * runtime, so a consumer still has to compile against it in a checkout that has
 * no tables to read.
 */

/** Direction a straight cliff-trigger jump moves in, plus its row/col delta. */
interface CliffDir {
  dr: number;
  dc: number;
  dir: 'n' | 's' | 'e' | 'w';
}

/** Mirrors `SimDoor['kind']` (shared/game/simulation/types.ts) without importing the engine type. */
type DoorKind = 'normal' | 'small-key' | 'big-key' | 'bombable' | 'shutter' | 'switch' | 'trap';

export type { CliffDir, DoorKind };
