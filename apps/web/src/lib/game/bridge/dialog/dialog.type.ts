/* @layer bridge-wasm @kind types */
interface HeapView {
  heap: Uint8Array;
  ptr: number;
}

interface FontView extends HeapView {
  size: number;
}

export type { FontView, HeapView };
