/* @layer renderer-hud @kind constants */
import type { SnesButton } from '@shared/types/controls';
import type { PromptButton } from '@shared/game/dialog/dialog-prompts';
import type { EquipmentState } from '@shared/game/types/game-state';
import type { DialogScale } from './DialogView.type';

const STORY_LEGEND_MESSAGE = 0x112;
const SPAWN_PICKER_MESSAGES = new Set([0x184, 0x185]);
const INTRO_TELEPATHY_MESSAGES = new Set([0x1f]);

const ITEM_SLOTS = 20;
const BOMBS_SLOT = 3;
const BOTTLE_CONTENTS_SLOT = 15;
const FIRST_BOTTLE = 28;
const BOTTLES = 4;

const EQUIPMENT_AT: Record<number, keyof EquipmentState> = {
  20: 'gloves',
  21: 'boots',
  22: 'flippers',
  23: 'moonPearl',
  25: 'sword',
  26: 'shield',
  27: 'armor',
};

const SNES_OF: Record<PromptButton, SnesButton> = {
  a: 'A', b: 'B', up: 'Up', down: 'Down', left: 'Left', right: 'Right',
};

const SCANLINE_LEAD = 1;

const INITIAL_DIALOG_SCALE: DialogScale = { height: 0, scale: 2, offsetX: 0, offsetY: 0 };

const FADE_MS = 140;

const NO_ATLASES: readonly (HTMLCanvasElement | null)[] = [null, null];

export {
  BOMBS_SLOT, BOTTLE_CONTENTS_SLOT, BOTTLES, EQUIPMENT_AT, FADE_MS, FIRST_BOTTLE, INITIAL_DIALOG_SCALE,
  INTRO_TELEPATHY_MESSAGES, ITEM_SLOTS, NO_ATLASES, SCANLINE_LEAD, SNES_OF, SPAWN_PICKER_MESSAGES, STORY_LEGEND_MESSAGE,
};
