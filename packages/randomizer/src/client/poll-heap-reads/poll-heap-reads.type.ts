/* @layer bridge-wasm @kind types */
interface HeapReads {
  roomWord: (roomId: number) => number;
  owByte: (owScreen: number) => number;
  progByte: (bufferIndex: number) => number;
}

export type { HeapReads };
