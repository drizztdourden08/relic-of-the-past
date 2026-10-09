/* @layer bridge-wasm @kind types */
interface ActiveDialogue {
  code: string;
  dictPacked: Uint8Array;
  lineChunks: Uint8Array[];
  fontWidths: Uint8Array;
}

export type { ActiveDialogue };
