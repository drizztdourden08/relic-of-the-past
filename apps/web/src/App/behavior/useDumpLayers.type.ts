/* @layer renderer-appshell @kind types */
interface DumpLayersDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
  openNavWidget: () => void;
}

export type { DumpLayersDeps };
