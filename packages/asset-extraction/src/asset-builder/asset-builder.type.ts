/* @layer shared-asset-extraction @kind types */
type AssetType = 'uint8' | 'uint16' | 'int8' | 'int16' | 'packed';

interface AssetEntry {
  type: AssetType;
  data: Buffer;
}

export type { AssetEntry };
