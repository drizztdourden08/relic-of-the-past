/* @layer renderer-hud @kind types */

/** One drawable cell of a gear row, either a ladder tier or a passive. */
interface GearRowCell {
  /** Sprite filename with no extension; '' for a tier that means "nothing worn". */
  sprite: string;
  /** At or below the high-water mark (a tier), or held (a passive). */
  owned: boolean;
  /** The tier currently worn, marked so the row says what is on right now. */
  equipped?: boolean;
}

interface PauseGearRowProps {
  label: string;
  cells: readonly GearRowCell[];
  /** Index of the cursor in this row, or -1 while it is on another row. */
  cursor: number;
  scale: number;
  spritesBase: string;
  onPick: (index: number) => void;
}

export type { GearRowCell, PauseGearRowProps };
