/* @layer shared-asset-extraction @kind types */
interface GbaAlttpSaveSlotProgression {
  slot: number;
  type: string;
  initialized: boolean;
  powers: number;
  swordBeam: boolean;
  hurricaneSpin: boolean;
  playerName: string;
  checksumStored: number;
  checksumCalculated: number;
  checksumValid: boolean;
}

export type { GbaAlttpSaveSlotProgression };
