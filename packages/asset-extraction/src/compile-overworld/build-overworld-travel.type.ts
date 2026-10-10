/* @layer shared-asset-extraction @kind types */
type TravelEntry =
  | { romIndex: number; birdTravelId: number }
  | { romIndex: number; whirlpoolSrcArea: number };

interface TravelTable {
  asset: string;
  base: number;
  signed: boolean;
}

export type { TravelEntry, TravelTable };
