/* @layer bridge-wasm @kind types */
interface UiBufferReader {
  u8: (at: number) => number;
  u16: (at: number) => number;
  run: (at: number, count: number) => number[];
}

export type { UiBufferReader };
