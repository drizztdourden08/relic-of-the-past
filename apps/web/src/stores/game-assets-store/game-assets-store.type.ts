/* @layer renderer-stores @kind types */
interface GameAssetsState {
  bakedGeneration: number;
  bootedGeneration: number | null;
  runningProfileName: string | null;
  markBaked: () => void;
  markBooted: () => void;
  clearBooted: () => void;
  registerReload: (profileName: string | null, reload: (() => void) | null) => void;
  canReload: boolean;
  reload: () => void;
}

export type { GameAssetsState };
