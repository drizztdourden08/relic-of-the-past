/* @layer shared-game @kind types */

interface ReferenceLocation {
  name: string;
  romAddress: number | null;
  isPrize: boolean;
}

interface ReferenceDataPackage {
  locationNameToId: Record<string, number>;
  itemNameToId: Record<string, number>;
}

export type { ReferenceDataPackage, ReferenceLocation };
