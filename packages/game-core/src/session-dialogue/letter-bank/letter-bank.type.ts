/* @layer bridge-wasm @kind types */
interface LetterSource {
  sheet: Uint8Array;
  texts: readonly string[];
  eu: boolean;
}

export type { LetterSource };
