/* @layer renderer-hud @kind types */
import type { HeartMode } from '../../primitives/HudHeart';

/** What closing the menu should do. */
type PauseAction = 'continue' | 'save-quit';

/** One dungeon item: its own sprite, drawn flat when the save does not hold it. */
interface DungeonItemCell {
  sprite: string;
  owned: boolean;
}

interface PauseStatusScreenProps {
  healthCurrent: number;
  healthCapacity: number;
  heartMode: HeartMode;
  /**
   * Armour tier from the save, 0..2. It tints every heart on this panel, the
   * same drawing the Enhanced HUD's own life block uses.
   *
   * Optional ONLY so the host can add its pass-through independently; the
   * default is a stand-in, not a design. A panel drawn without it reports the
   * armour-0 tint at every tier, which is the bug this prop exists to close.
   * `GameUIState.equipment.armor` is the value, and `usePauseMenu` already
   * publishes it as `data.armor`.
   */
  armor?: number;
  /** Heart-piece progress, 0..3. */
  heartPieces: number;
  /** Raw magic power, 0..128. */
  magic: number;
  halfMagic: boolean;
  /** Bitmasks straight from the save. */
  pendants: number;
  crystals: number;
  /** Map, compass and the great key of whichever dungeon the player is in. */
  dungeonItems: readonly DungeonItemCell[];
  /** Index of the focused action; the two are Continue and Save & quit. */
  cursor: number;
  scale: number;
  spritesBase: string;
  onFocusAction: (cursor: number) => void;
  /**
   * Firing the row the cursor is now on. This is the pad's confirm, from a pointer.
   * Which of the two ways out that is follows from the cursor, decided where
   * the pad's own confirm is decided, not named again here.
   */
  onConfirm: () => void;
}

export type { DungeonItemCell, PauseAction, PauseStatusScreenProps };
