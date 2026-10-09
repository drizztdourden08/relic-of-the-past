/* @layer bridge-wasm @kind types */
import type { NameTables } from './ap-names';

interface PrintSide {
  names: NameTables;
  slot: number | null;
  team: number | null;
}

export type { PrintSide };
