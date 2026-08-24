/* @layer shared-game @kind logic */
/**
 * Slots for the pause-menu surfaces: the inventory item names, the bottle
 * contents, the six panel headings and the six ability words.
 *
 * The first three come straight from the shipped name table, so the keys here
 * ARE that table's keys — `<record-id>-<tier>` for an item, the raw bottle
 * content value, the panel key — and an override can be folded back onto it
 * without a translation step. The ability words have no data home yet (they are
 * still an array inside the drawing component), so they are restated here.
 *
 * Every one of these surfaces draws from a fixed A-Z ramp rather than the set's
 * glyph sheet, hence `latin-caps` throughout.
 */
import { defaultPauseNames } from '@shared/game/data/pause-names';
import type { PauseLabelKey } from '../../types';
import type { TextLimit, TextSlot } from '../types';

/** Proven from the drawing tables in the core: 8 glyphs over 2 lines per item. */
const ITEM_LIMIT: TextLimit = { kind: 'glyphs', max: 8, lines: 2 };
/** Same tables, ability box: 5 glyphs over 2 lines. */
const ABILITY_LIMIT: TextLimit = { kind: 'glyphs', max: 5, lines: 2 };
/** A heading occupies one row of the panel's inner width. */
const LABEL_LIMIT: TextLimit = { kind: 'glyphs', max: 8 };

/** The panel headings, in the order the menu stacks them. */
const PANEL_LABEL_KEYS: PauseLabelKey[] = [
  'item', 'equipment', 'dungeon-item', 'crystals', 'pendants', 'do',
];

/**
 * The six ability words, copied from the hardcoded `abilityGrid` array in
 * apps/web/src/ui/domains/hud/compounds/PauseAbilitiesPanel/PauseAbilitiesPanel.tsx.
 * Restated rather than imported: nothing under shared/ may reach into apps/.
 */
const ABILITY_WORDS = ['LIFT', 'READ', 'TALK', 'PULL', 'RUN', 'SWIM'];

/** The one ability the drawing code suffixes at runtime with its level. */
const LEVELLED_ABILITY = 'LIFT';

/** `item-012-2` → `item-012` + tier `2`; the tier is always the last segment. */
const splitItemKey = (key: string): { recordId: string; tier: string } => {
  const cut = key.lastIndexOf('-');
  return { recordId: key.slice(0, cut), tier: key.slice(cut + 1) };
};

const itemSlot = (key: string, fallback: string): TextSlot => {
  const { recordId, tier } = splitItemKey(key);
  return {
    key,
    label: tier === '1' ? recordId : `${recordId} (tier ${tier})`,
    fallback,
    limit: ITEM_LIMIT,
    alphabet: 'latin-caps',
  };
};

const bottleSlot = (content: string, fallback: string): TextSlot => ({
  key: `bottle-${content}`,
  label: `bottle contents ${content}`,
  fallback,
  limit: ITEM_LIMIT,
  alphabet: 'latin-caps',
});

const labelSlot = (key: PauseLabelKey): TextSlot => ({
  key: `label-${key}`,
  label: `panel heading: ${key}`,
  fallback: defaultPauseNames.labels[key],
  limit: LABEL_LIMIT,
  alphabet: 'latin-caps',
});

const abilitySlot = (word: string): TextSlot => ({
  key: `ability-${word.toLowerCase()}`,
  label: `ability: ${word.toLowerCase()}`,
  fallback: word,
  limit: ABILITY_LIMIT,
  alphabet: 'latin-caps',
  ...(word === LEVELLED_ABILITY
    ? { note: 'The menu appends a level suffix (".1" / ".2" / ".3") to this word, which counts against the glyph budget.' }
    : {}),
});

/**
 * All 42 pause-menu slots: 23 item names, 7 bottle contents, 6 panel headings,
 * 6 ability words.
 */
const pauseNameSlots = (): TextSlot[] => {
  const { items, bottles } = defaultPauseNames;
  return [
    ...Object.entries(items).map(([key, value]) => itemSlot(key, value)),
    ...Object.entries(bottles).map(([content, value]) => bottleSlot(content, value)),
    ...PANEL_LABEL_KEYS.map(labelSlot),
    ...ABILITY_WORDS.map(abilitySlot),
  ];
};

export { pauseNameSlots };
