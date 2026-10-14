/* @layer renderer-hud @kind types */
import type { CoreBindings, SlotIndex, ItemCell, PauseScreen, PauseSection, PlayerSheet, Wearing } from '@rotp/game-data';
import type { ResolvedRow } from '@rotp/packs';
import type { GearLadder, GearRowCell } from '../../compounds/PauseGearScreen';
import type { HudNodeContent } from '../../compounds/HudNodeRenderer';
import type { DungeonItemCell } from '../../compounds/PauseStatusScreen';
import type { NavLegendEntry } from '../../compounds/PauseNavLegend';
import type { HeartMode } from '../../primitives/HudHeart';
import type { PlacedLayout } from '../HudLayoutView/HudLayoutView.type';
import type { StatusVitals } from './sub-components/PauseScreenHost/PauseScreenHost.type';

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

interface PauseVitals {
  vitals: StatusVitals;
  spritesBase: string;
}

interface ButtonCluster {
  packId: string;
  placed: PlacedLayout;
  content: HudNodeContent;
  dataScope: Readonly<Record<string, number>>;
  hudSprites: string;
}

interface PauseNavigation {
  screen: PauseScreen;
  section: PauseSection;
  cursor: number;
  items: ItemModel;
  gear: GearModel;
  dungeonItems: readonly DungeonItemCell[];
  hintLines: readonly string[];
  assign: (slot: SlotIndex) => void;
  move: PauseCursor;
  legend: NavLegendEntry[];
}

interface PauseScreenLayerProps {
  nav: PauseNavigation;
  vitals: StatusVitals;
  heartMode: HeartMode;
  scale: number;
  spritesBase: string;
}

interface PauseButtonClusterProps {
  cluster: ButtonCluster;
  scale: number;
  onSlotPress: (slot: SlotIndex) => void;
}

export type {
  BrowsingView, ButtonCluster, EnhancedPauseViewProps, GearModel, HeroWearing, ItemModel, LegendRow, PauseAssign,
  PauseButtonClusterProps, PauseCursor, PauseNavigation, PauseScreenLayerProps, PauseVitals, ScreenPoint,
};
