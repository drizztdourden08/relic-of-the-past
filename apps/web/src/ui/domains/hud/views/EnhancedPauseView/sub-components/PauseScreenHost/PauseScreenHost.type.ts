/* @layer renderer-hud @kind types */
import type { PauseScreen, PauseSection } from '@shared/game/logic/pause';
import type { HeartMode } from '../../../../primitives/HudHeart';
import type { DungeonItemCell } from '../../../../compounds/PauseStatusScreen';
import type { GearModel, ItemModel } from '../../EnhancedPauseView.type';

interface StatusVitals {
  healthCurrent: number;
  healthCapacity: number;
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
  hintLines: readonly string[];
  scale: number;
  spritesBase: string;
  onFocus: (screen: PauseScreen, section: PauseSection, cursor: number) => void;
  onConfirm: () => void;
}

export type { PauseScreenHostProps, StatusVitals };
