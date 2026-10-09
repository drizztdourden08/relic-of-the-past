/* @layer shared-game @kind logic */
import { pauseNameSlots } from './catalog/pause-names';
import { slotsFromDecoded } from './catalog/from-decoded';
import { worldNameSlots } from './catalog/world-names';
import type { BuildGroupsParams, TextGroup } from './types';
import { GROUP_TITLES } from './text.constants';

const buildGroups = (params: BuildGroupsParams): TextGroup[] => {
  const { menu, credits, records, decodedNote } = params;
  const decoded = decodedNote === undefined ? {} : { note: decodedNote };
  return [
    { id: 'pause-names', title: GROUP_TITLES['pause-names'], slots: pauseNameSlots() },
    { id: 'menu', title: GROUP_TITLES.menu, slots: slotsFromDecoded(menu), ...decoded },
    { id: 'credits', title: GROUP_TITLES.credits, slots: slotsFromDecoded(credits), ...decoded },
    { id: 'world-names', title: GROUP_TITLES['world-names'], slots: worldNameSlots(records) },
  ];
};

export { buildGroups };
