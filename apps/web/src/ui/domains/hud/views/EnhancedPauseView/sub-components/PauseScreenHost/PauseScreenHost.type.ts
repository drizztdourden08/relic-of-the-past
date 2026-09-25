/* @layer renderer-hud @kind types */
import type { PauseScreen, PauseSection } from '@shared/game/logic/pause';
import type { HeartMode } from '../../../../primitives/HudHeart';
import type { DungeonItemCell } from '../../../../compounds/PauseStatusScreen';
import type { GearModel } from '../../behavior/useGearModel';
import type { ItemModel } from '../../behavior/useItemModel';

/** The save's own numbers, as the status screen reports them. */
interface StatusVitals {
  healthCurrent: number;
  healthCapacity: number;
  /** Armour tier. Tints the drawn hearts, so the panel matches the main HUD. */
  armor: number;
  magic: number;
  halfMagic: boolean;
  heartPieces: number;
  pendants: number;
  crystals: number;
}

interface PauseScreenHostProps {
  screen: PauseScreen;
  section: PauseSection;
  cursor: number;
  items: ItemModel;
  gear: GearModel;
  dungeonItems: readonly DungeonItemCell[];
  vitals: StatusVitals;
  heartMode: HeartMode;
  /**
   * The line under the panel: the invitation this section offers, or a refusal.
   * Chosen AND wrapped by the view, so no screen has to know the menu's wording
   * or how many rows it took.
   */
  hintLines: readonly string[];
  scale: number;
  spritesBase: string;
  onFocus: (screen: PauseScreen, section: PauseSection, cursor: number) => void;
  /** Fire the cell the cursor is on. One door for every screen. */
  onConfirm: () => void;
}

export type { PauseScreenHostProps, StatusVitals };
