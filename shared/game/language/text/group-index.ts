/* @layer shared-game @kind logic */
/**
 * Assembles the four groups the editor renders, in the order it renders them.
 *
 * This is the whole catalog: rebuilt from the shipped data on every call, never
 * stored. Two of the groups come from data this module can reach on its own;
 * the other two are decoded from the loaded pack by the caller and handed in,
 * because nothing here may reach into the extraction pipeline. The record
 * source is handed in for the same reason in reverse: importing it here would
 * pull the dataset into every bundle that touches storage.
 */
import { pauseNameSlots } from './catalog/pause-names';
import { slotsFromDecoded } from './catalog/from-decoded';
import { worldNameSlots } from './catalog/world-names';
import type { RecordSource } from './catalog/world-names';
import type { DecodedLine } from './catalog/from-decoded';
import type { TextGroup } from './types';

type BuildGroupsParams = {
  menu: DecodedLine[];
  credits: DecodedLine[];
  /** How to reach the named records; see `catalog/world-names.ts` for why. */
  records: RecordSource;
  /** Said once for each decoded group when the words came from another region's file. */
  decodedNote?: string;
};

const GROUP_TITLES = {
  'pause-names': 'Pause menu',
  menu: 'Menus and system text',
  credits: 'Closing sequence',
  'world-names': 'Places, rooms and pickups',
} as const;

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

export { buildGroups, GROUP_TITLES };
export type { BuildGroupsParams };
