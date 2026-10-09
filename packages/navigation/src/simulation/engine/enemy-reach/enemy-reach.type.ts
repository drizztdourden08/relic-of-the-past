/* @layer shared-game @kind types */
import type { GridPos } from '@rotp/game-core';
import type { ItemId } from '@rotp/game-data';
import type { SimSprite } from '../../types/interactable.type';
import type { ScreenGridBundle } from '../../types/observation.type';
import type { CombatContext } from '../../types/combat.type';
import type { RoomSectionSplit } from '@rotp/game-core';

type ReachKind = 'contact' | 'travelling';

interface Weapon {
  ancillaType: number | null;
  damageClass: number;
  kind: ReachKind;
  travel: number;
  label: string;
}

interface EnemyReach {
  sprite: SimSprite;
  health: number;
  killable: boolean;
  by?: Weapon;
  from?: GridPos;
  blockedBy?: 'no-weapon' | 'no-line' | 'gated-off';
}

interface RoomThreat {
  gating: EnemyReach[];
  clearable: boolean;
}

interface RoomThreatParams {
  sprites: SimSprite[];
  reached: boolean[][] | undefined;
  grids: ScreenGridBundle | undefined;
  inventory: ReadonlySet<ItemId>;
  combat: CombatContext | undefined;
  split?: RoomSectionSplit;
}

export type { ReachKind, Weapon, EnemyReach, RoomThreat, RoomThreatParams };
