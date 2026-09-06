/* @layer shared-game @kind data */
/**
 * Live-verified crosswalk anchors: reference-project location names paired
 * with the (roomId, chestIndex) each one was confirmed to occupy in the
 * native chest table. Data file: location names are transcribed game data
 * and stay out of logic/test code, which imports them from here.
 */
interface AnchorCheck {
  apName: string;
  roomId: number;
  chestIndex: number;
}

const anchorChecks: AnchorCheck[] = [
  { apName: "Link's House", roomId: 0x104, chestIndex: 0 },
  { apName: 'Hyrule Castle - Map Chest', roomId: 0x72, chestIndex: 0 },
  { apName: "Hyrule Castle - Zelda's Chest", roomId: 0x80, chestIndex: 0 },
  { apName: 'Sewers - Secret Room - Left', roomId: 0x11, chestIndex: 0 },
  { apName: 'Sewers - Secret Room - Middle', roomId: 0x11, chestIndex: 1 },
  { apName: 'Sewers - Secret Room - Right', roomId: 0x11, chestIndex: 2 },
  { apName: "Sahasrahla's Hut - Left", roomId: 0x105, chestIndex: 0 },
];

/** Name groups expected to occupy consecutive chest-table entries, in listed order. */
const strideGroups: string[][] = [
  ['Sewers - Secret Room - Left', 'Sewers - Secret Room - Middle', 'Sewers - Secret Room - Right'],
  ["Blind's Hideout - Top", "Blind's Hideout - Left", "Blind's Hideout - Right"],
];

export { anchorChecks, strideGroups };
export type { AnchorCheck };
