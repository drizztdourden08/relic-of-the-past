/* @layer renderer-hud @kind constants */
import { HUD_EDGE_INSET, VITALS_RESERVE } from '@rotp/hud';
import { SDL_AXIS, OUTFIT_IDS } from '@rotp/game-data';
import type { GearLadderKind, PauseScreen, PauseSection, HeroPose, OutfitId } from '@rotp/game-data';
import type { SdlPosition } from '@rotp/input-mapping';
import type { GearSection } from '../../compounds/PauseGearScreen';
import type { BrowsingView } from './EnhancedPauseView.type';

const MENU_INSET = HUD_EDGE_INSET;

const TABS_X = VITALS_RESERVE.x + VITALS_RESERVE.w + HUD_EDGE_INSET;
const TABS_Y = 46;
const SCREEN_Y = 56;
const CLUSTER_INSET = 8;
const CLUSTER_TOP = 8;

const SCREEN_TABS: readonly { id: PauseScreen; label: string }[] = [
  { id: 'items', label: 'ITEMS' },
  { id: 'gear', label: 'GEAR' },
  { id: 'status', label: 'STATUS' },
];

const GEAR_LABELS = { sword: 'BLADE', shield: 'GUARD', mail: 'ARMOR', bow: 'ARROWS', passive: 'HELD' } as const;

const ASSIGN_HINT = 'PRESS A BUTTON TO ASSIGN';
const REFUSE_HINT = 'NOT FOUND YET';
const GEAR_HINT = 'FADED TIERS ARE NOT FOUND YET';
const HINT_COLUMNS = 16;
const ASSIGN_BLADE_HINT = 'PRESS A BUTTON TO ASSIGN THE BLADE';
const ASSIGN_ACTION_HINT = 'PRESS A BUTTON TO ASSIGN THE ACTION';
const REFUSE_MS = 1600;

const LEGEND_VERBS = {
  screen: 'SCREEN', move: 'MOVE', cancel: 'BACK', close: 'CLOSE', assign: 'ASSIGN',
} as const;

const CONFIRM_VERBS = { equip: 'EQUIP', unequip: 'REMOVE', exit: 'ACTIVATE' } as const;

const ANY_BUTTON = 'ANY';

const SECTION_OF: Record<GearLadderKind, GearSection> = {
  sword: 'sword', shield: 'shield', mail: 'mail', bow: 'bow',
};

const PASSIVE_RECORDS: readonly (readonly string[])[] = [
  ['item-028', 'item-029'], ['item-076'], ['item-031'], ['item-032'],
];

const ARMOUR_OUTFITS: readonly OutfitId[] = OUTFIT_IDS.slice(0, 3);
const MAX_GLOVES = 2;

const STICK_OF_AXIS: Record<number, SdlPosition> = {
  [SDL_AXIS.LEFT_X]: 'LEFT_X', [SDL_AXIS.LEFT_Y]: 'LEFT_Y',
  [SDL_AXIS.RIGHT_X]: 'RIGHT_X', [SDL_AXIS.RIGHT_Y]: 'RIGHT_Y',
};

const GEAR_HINTS: Partial<Record<PauseSection, string>> = {
  sword: ASSIGN_BLADE_HINT,
  passive: ASSIGN_ACTION_HINT,
};

const DUNGEON_RECORDS: readonly string[] = ['item-052', 'item-038', 'item-051'];
const NO_PALACE = 0xff;
const TOP_BIT = 0x8000;

const FIRST_CELL: BrowsingView = { screen: 'items', section: 'items', cursor: 0, canConfirm: false };

const GAME_FPS = 60;

const AT_REST: HeroPose = { action: 0x00, frame: 0, facing: 1, offsetX: 0, offsetY: 0 };

export {
  ANY_BUTTON, ARMOUR_OUTFITS, ASSIGN_ACTION_HINT, ASSIGN_BLADE_HINT, ASSIGN_HINT, AT_REST, CLUSTER_INSET, CLUSTER_TOP,
  CONFIRM_VERBS, DUNGEON_RECORDS, FIRST_CELL, GAME_FPS, GEAR_HINT, GEAR_HINTS, GEAR_LABELS, HINT_COLUMNS, LEGEND_VERBS,
  MAX_GLOVES, MENU_INSET, NO_PALACE, PASSIVE_RECORDS, REFUSE_HINT, REFUSE_MS, SCREEN_TABS, SCREEN_Y, SECTION_OF,
  STICK_OF_AXIS, TABS_X, TABS_Y, TOP_BIT,
};
