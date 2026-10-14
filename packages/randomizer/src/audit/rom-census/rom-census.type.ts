/* @layer shared-game @kind types */

interface RomChest {
  roomId: number;
  chestIndex: number;
  itemByte: number;
  big: boolean;
}

interface RomCensus {
  chestsByRoom: Map<number, RomChest[]>;
  flat: RomChest[];
  totalChests: number;
}

interface ChestMismatch {
  checkId: string;
  name: string;
  roomId: number | null;
  chestIndex: number | null;
  reason: string;
}

interface VanillaItemDiff {
  checkId: string;
  name: string;
  romItemByte: number;
  datasetReceiveId: number | null;
}

interface CensusFindings {
  chestMismatches: ChestMismatch[];
  vanillaItemDiffs: VanillaItemDiff[];
}

type ChestInspection = { mismatch: ChestMismatch } | { chest: RomChest };

export type { CensusFindings, ChestInspection, ChestMismatch, RomCensus, RomChest, VanillaItemDiff };
