/* @layer shared-game @kind logic */
import { defaultPauseNames } from '@shared/game/data/pause-names';
import type { PauseLabelKey } from '../../types';
import type { TextSlot } from '../types';
import {
  ABILITY_LIMIT, ABILITY_WORDS, ITEM_LIMIT, LABEL_LIMIT, LEVELLED_ABILITY, PANEL_LABEL_KEYS,
} from './pause-names.constants';

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
