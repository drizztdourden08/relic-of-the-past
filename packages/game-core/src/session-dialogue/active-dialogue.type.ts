/* @layer bridge-wasm @kind types */
interface ActiveDialogue {
  code: string;
  dictPacked: Uint8Array;
  lineChunks: Uint8Array[];
  fontSheet: Uint8Array;
  fontWidths: Uint8Array;
  bakedLetters: string[];
}

export type { ActiveDialogue };
