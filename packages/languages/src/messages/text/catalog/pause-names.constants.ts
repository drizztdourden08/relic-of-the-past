/* @layer shared-game @kind constants */
import type { PauseLabelKey } from '../../types';
import type { TextLimit } from '../types';

const ITEM_LIMIT: TextLimit = { kind: 'glyphs', max: 8, lines: 2 };
const ABILITY_LIMIT: TextLimit = { kind: 'glyphs', max: 5, lines: 2 };
const LABEL_LIMIT: TextLimit = { kind: 'glyphs', max: 8 };

const PANEL_LABEL_KEYS: PauseLabelKey[] = [
  'item', 'equipment', 'dungeon-item', 'crystals', 'pendants', 'do',
];

const ABILITY_WORDS = ['LIFT', 'READ', 'TALK', 'PULL', 'RUN', 'SWIM'];

const LEVELLED_ABILITY = 'LIFT';

export { ABILITY_LIMIT, ABILITY_WORDS, ITEM_LIMIT, LABEL_LIMIT, LEVELLED_ABILITY, PANEL_LABEL_KEYS };
