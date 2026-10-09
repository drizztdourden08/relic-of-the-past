/* @layer shared-asset-extraction @kind types */
interface DropSheets {
  sheets: Map<number, Buffer>;
  sheet96: Buffer;
}

interface SheetForChar {
  sheet: Buffer;
  offset: number;
  high: boolean;
}

export type { DropSheets, SheetForChar };
