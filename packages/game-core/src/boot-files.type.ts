/* @layer bridge-wasm @kind types */
interface BootFiles {
  assetData: Uint8Array;
  configIni?: string;
  sramData?: Uint8Array | null;
  linkSprite: Uint8Array | null;
}

export type { BootFiles };
