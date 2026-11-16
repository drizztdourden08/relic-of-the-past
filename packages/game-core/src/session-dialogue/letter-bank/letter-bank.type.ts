/* @layer bridge-wasm @kind types */
interface LetterSource {
  sheet: Uint8Array;
  texts: readonly string[];
  eu: boolean;
  baked: readonly string[];
}

export type { LetterSource };
