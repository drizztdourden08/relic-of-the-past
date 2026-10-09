/* @layer shared-game @kind types */
import type { ScreenTag, ConnectionTag } from '../data';
import type { RegionNavData, ConnectionNavData } from '../pathfinding/nav-data.types';

type ScreenType = 'overworld' | 'dungeon' | 'interior';

type World = 'light' | 'dark';

type InteriorKind =
  | 'house'
  | 'cave'
  | 'shop'
  | 'fairy'
  | 'well'
  | 'passage'
  | 'hint'
  | 'gamble'
  | 'special';

interface OverworldContext {
  gridX: number;
  gridY: number;
}

interface DungeonContext {
  palaceIndex: number;
  floor?: number;
  gridX?: number;
  gridY?: number;
}

interface InteriorContext {
  kind: InteriorKind;
}

type VariantCondition =
  | { type: 'flag'; address: number; bit: number; value: boolean }
  | { type: 'check'; name: string; collected: boolean }
  | { type: 'entrance'; id: number }
  | { type: 'progress'; min?: number; max?: number }
  | { type: 'always' };

interface ScreenVariantInfo {
  key: string;
  label?: string;
  progressTier?: number | [number, number];
  condition: VariantCondition;
}

interface ScreenBundle {
  id: string;
  name: string;
  screens: readonly string[];
  layout?: BundleLayout;
}

type BundleLayout =
  | { type: 'grid'; columns: number }
  | { type: 'linear'; direction: 'horizontal' | 'vertical' }
  | { type: 'stacked' };

interface ScreenBase {
  id: string;
  name: string;
  world: World;
  location: string;
  area: string;
  roomIndex?: number;
  entranceId?: number;
  variant?: ScreenVariantInfo;
  status?: 'draft' | 'mapped' | 'verified';
  tags: readonly ScreenTag[];
  nav?: RegionNavData;
}

interface OverworldScreen extends ScreenBase {
  type: 'overworld';
  overworld: OverworldContext;
}

interface DungeonScreen extends ScreenBase {
  type: 'dungeon';
  dungeon: DungeonContext;
}

interface InteriorScreen extends ScreenBase {
  type: 'interior';
  interior: InteriorContext;
}

type ScreenDefinition = OverworldScreen | DungeonScreen | InteriorScreen;

interface ScreenConnection {
  from: string;
  to: string;
  tags: readonly ConnectionTag[];
  entranceId?: number;
  stairIndex?: number;
  exitId?: number;
  status?: 'draft' | 'mapped' | 'verified';
  nav?: ConnectionNavData;
}

export type {
  BundleLayout,
  DungeonContext,
  DungeonScreen,
  InteriorContext,
  InteriorKind,
  InteriorScreen,
  OverworldContext,
  OverworldScreen,
  ScreenBase,
  ScreenBundle,
  ScreenConnection,
  ScreenDefinition,
  ScreenType,
  ScreenVariantInfo,
  VariantCondition,
  World,
};
