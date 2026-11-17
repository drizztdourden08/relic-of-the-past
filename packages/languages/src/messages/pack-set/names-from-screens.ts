/* @layer shared-game @kind logic */
import type { ScreenPayload } from '@rotp/asset-extraction';
import type { NameTable } from '../types';
import { decodePauseEntry } from './decode-pause-entry';
import { emptyNameTable } from './empty-name-table';
import { BOTTLE_COUNT, FIRST_BOTTLE_CONTENT, FIRST_BOTTLE_ENTRY, ITEM_SLOTS } from './names-from-screens.constants';

const fillBottles = (names: NameTable, screens: ScreenPayload): void => {
  for (let i = 0; i < BOTTLE_COUNT; i += 1) {
    const name = decodePauseEntry(screens.pauseText.bottles, FIRST_BOTTLE_ENTRY + i);
    if (name !== null) names.bottles[FIRST_BOTTLE_CONTENT + i] = name;
  }
};

const fillItems = (names: NameTable, screens: ScreenPayload): void => {
  for (const slot of ITEM_SLOTS) {
    const name = decodePauseEntry(screens.pauseText[slot.table], slot.entry);
    if (name !== null) names.items[slot.key] = name;
  }
};

const namesFromScreens = (screens?: ScreenPayload): NameTable => {
  const names = emptyNameTable();
  if (!screens) return names;
  fillItems(names, screens);
  fillBottles(names, screens);
  return names;
};

export { namesFromScreens };
