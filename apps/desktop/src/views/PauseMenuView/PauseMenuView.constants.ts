/* @layer renderer-hud @kind constants */
import type { BottlePhase, NameGrid } from './PauseMenuView.type';

const MENU_H = 224;

const BOTTLE_ITEM_SLOT = 15;

const BOTTLE_PHASE_CLASS: Record<BottlePhase, string> = {
  hidden: '',
  visible: '',
  expanding: ' pause-menu__bottle--expanding',
  collapsing: ' pause-menu__bottle--collapsing',
};

const GRID_TO_SAVE = [0, 3, 2, 14, 1, 10, 5, 6, 15, 16, 17, 9, 4, 8, 7, 12, 11, 18, 13, 19];

const SLOT_RECORD_IDS = [
  'item-012', 'item-013', 'item-011', 'item-041', 'item-042',
  'item-008', 'item-009', 'item-016', 'item-017', 'item-018',
  'item-019', 'item-010', 'item-020', 'item-034', 'item-030',
  'item-023', 'item-022', 'item-025', 'item-026', 'item-027',
];

const AMPERSAND_COLS = 2;

const NAME_PANEL_GRID: NameGrid = { maxCols: 8, maxLines: 2 };

// eslint-disable-next-line local/no-em-dash
const SEPARATORS = new Set(['-', '‐', '‑', '‒', '–', '—', '_', '/', '\\', '·']);

const SPECIAL_FOLDS: Record<string, string> = {
  'Æ': 'AE', 'æ': 'AE', 'Œ': 'OE', 'œ': 'OE',
  'Ø': 'O', 'ø': 'O', 'Đ': 'D', 'đ': 'D',
  'Ð': 'D', 'ð': 'D', 'Þ': 'TH', 'þ': 'TH',
  'Ł': 'L', 'ł': 'L', 'Ŋ': 'N', 'ŋ': 'N',
  'ı': 'I', 'İ': 'I', 'Ħ': 'H', 'ħ': 'H',
};

export { AMPERSAND_COLS, BOTTLE_ITEM_SLOT, BOTTLE_PHASE_CLASS, GRID_TO_SAVE, MENU_H, NAME_PANEL_GRID, SEPARATORS, SLOT_RECORD_IDS, SPECIAL_FOLDS };
