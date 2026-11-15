/* @layer bridge-wasm @kind types */
import type { FontReference, RomData } from '@rotp/asset-extraction';

interface LibraryReferences {
  baseRom: RomData | null;
  references: FontReference[];
}

export type { LibraryReferences };
