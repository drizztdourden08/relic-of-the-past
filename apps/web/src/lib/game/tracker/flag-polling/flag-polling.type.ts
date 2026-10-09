/* @layer bridge-wasm @kind types */
interface WasmModule {
  ccall(name: string, returnType: string, argTypes: string[], args: unknown[]): unknown;
  HEAPU8?: Uint8Array;
}

interface RoomWords {
  read: (roomId: number) => number;
}

export type { WasmModule, RoomWords };
