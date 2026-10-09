/* @layer shared-game @kind types */
interface SlotReader {
  validSlots: (sram: Uint8Array) => number[];
  blockOffset: (sram: Uint8Array, slot: number) => number | null;
}

export type { SlotReader };
