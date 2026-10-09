/* @layer bridge-wasm @kind types */
interface OverworldVariantInfo {
  progressIndicator: number;
  screenEventFlags: number;
  eventOverlayActive: boolean;
  phaseLabel: string;
}

interface GameProgressInfo {
  tier: number;
  label: string;
}

export type { OverworldVariantInfo, GameProgressInfo };
