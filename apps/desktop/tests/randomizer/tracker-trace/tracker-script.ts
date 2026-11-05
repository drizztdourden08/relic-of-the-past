/* @layer tests @kind helper */
import type { ItemId } from '@rotp/game-data';
import type { TrackerStep } from './tracker-script.type';

const EARLY_ITEMS: readonly ItemId[] = ['item-076', 'item-019'];
const MID_ITEMS: readonly ItemId[] = [...EARLY_ITEMS, 'item-031', 'item-028', 'item-011', 'item-010', 'item-032', 'item-079', 'item-008', 'item-012', 'item-027'];
const LATE_ITEMS: readonly ItemId[] = [...MID_ITEMS, 'item-029', 'item-016', 'item-017', 'item-018', 'item-021', 'item-023', 'item-009', 'item-022', 'item-025', 'item-026', 'item-030', 'item-083'];

const base: TrackerStep = {
  name: '', completedEvery: 0, completedLimit: 0, fired: 0, items: [], events: 'none',
  darkRoomsNeedLight: true, bigKeyDoors: true, smallKeyDoors: true,
};

const MID: TrackerStep = { ...base, name: 'mid', completedEvery: 4, completedLimit: 400, fired: 5, items: MID_ITEMS };
const LATE: TrackerStep = { ...base, name: 'late', completedEvery: 2, completedLimit: 400, fired: 12, items: LATE_ITEMS, events: 'half' };

const TRACKER_STEPS: readonly TrackerStep[] = [
  { ...base, name: 'nothing held' },
  { ...base, name: 'early', completedEvery: 1, completedLimit: 8, items: EARLY_ITEMS },
  { ...base, name: 'early with fired keys', completedEvery: 1, completedLimit: 8, fired: 3, items: EARLY_ITEMS },
  MID,
  { ...MID, name: 'mid, dark rooms need no light', darkRoomsNeedLight: false },
  { ...MID, name: 'mid, big key doors off', bigKeyDoors: false },
  { ...MID, name: 'mid, small key doors off', smallKeyDoors: false },
  { ...MID, name: 'mid, half the events', events: 'half' },
  LATE,
  { ...LATE, name: 'late, all toggles off', events: 'all', darkRoomsNeedLight: false, bigKeyDoors: false, smallKeyDoors: false },
  { ...LATE, name: 'every check done', completedEvery: 1, completedLimit: 100000, fired: 100000, events: 'all' },
];

export { TRACKER_STEPS };
