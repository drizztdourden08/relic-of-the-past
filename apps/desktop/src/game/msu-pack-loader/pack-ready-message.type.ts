/* @layer bridge-wasm @kind types */
type PackReadyMessageParams = {
  packName: string;
  manifest: { tracks: readonly unknown[] } | null;
  audioFileCount: number;
  trackCount: number;
  isDeluxe: boolean;
};

export type { PackReadyMessageParams };
