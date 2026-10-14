/* @layer renderer-appshell @kind types */
import type { HoverTile } from './dump-layers.type';

interface DumpLayersDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
  openNavWidget: () => void;
}

interface RunDumpLayersParams {
  activeProfile: Profile;
  loadProfileForGame: (profile: Profile) => Promise<void>;
  openNavWidget: () => void;
  slot: number;
  hoverTile: HoverTile | null;
  isCancelled: () => boolean;
}

export type { DumpLayersDeps, RunDumpLayersParams };
