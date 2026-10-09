/* @layer renderer-hud @kind types */
import type { CoreBindings, SlotIndex } from '@rotp/game-data';
import type { ItemCell, PauseScreen, PauseSection } from '@rotp/game-data';
import type { PlayerSheet, Wearing } from '@rotp/game-data';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';
import type { GearLadder, GearRowCell } from '../../compounds/PauseGearScreen';

interface EnhancedPauseViewProps {
  slideTransform?: string;
  slideTransition?: string;
}

interface ScreenPoint { x: number; y: number }

interface GearModel {
  ladders: readonly GearLadder[];
  passives: readonly GearRowCell[];
}

interface HeroWearing {
  sheet: PlayerSheet | null;
  row: ResolvedRow | null;
  wearing: Wearing;
}

interface ItemModel {
  cells: readonly ItemCell[];
  items: readonly ItemCell[];
  bottles: readonly ItemCell[];
  nameLines: readonly string[];
}

interface LegendRow {
  id: string;
  verb: string;
  verbs: readonly (keyof CoreBindings)[];
  text?: string;
}

interface PauseAssign {
  assign: (slot: SlotIndex) => void;
  hintLines: readonly string[];
}

interface PauseCursor {
  focus: (screen: PauseScreen, section: PauseSection, cursor: number) => void;
  selectScreen: (screen: PauseScreen) => void;
  confirm: () => void;
}

interface BrowsingView {
  screen: PauseScreen;
  section: PauseSection;
  cursor: number;
  canConfirm: boolean;
}

export type {
  BrowsingView, EnhancedPauseViewProps, GearModel, HeroWearing, ItemModel, LegendRow, PauseAssign, PauseCursor, ScreenPoint,
};
