/* @layer renderer-components @kind types */
/**
 * What the positional-capture step asks about and records. A target is a
 * fixed, ordered ask ("press A", "move the LEFT stick") built from SDL's own
 * capability report for the connected device before any input arrives; a
 * record is the outcome once the user answers it or skips it. The
 * joystick-level index that actually fired is compared against the SDL
 * position's own index, so a mismatch (something firing at a different raw
 * index than the name SDL gave it) is visible in the recorded data instead
 * of silently invisible.
 */

interface PositionalTarget {
  id: string;
  kind: 'button' | 'axis';
  label: string;
  category: string;
  /** The SDL_BUTTON index for a button target's own position, null for an
   *  axis target (which has no comparable single index). */
  expectedIndex: number | null;
}

interface PositionalCaptureRecord {
  id: string;
  kind: 'button' | 'axis';
  askedLabel: string;
  status: 'captured' | 'skipped';
  /** The joystick-level button/axis index that actually fired, or null when skipped. */
  firedIndex: number | null;
  /** The positional name at that index (SOUTH, LEFT_TRIGGER, ...), or null when skipped. */
  firedPositionalName: string | null;
  expectedIndex: number | null;
  /** True only when firedIndex and expectedIndex are both known and disagree. */
  mismatch: boolean;
}

export type { PositionalCaptureRecord, PositionalTarget };
