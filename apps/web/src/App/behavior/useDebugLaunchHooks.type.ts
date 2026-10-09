/* @layer renderer-appshell @kind types */
interface DebugLaunchDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
  openNavWidget: () => void;
}

export type { DebugLaunchDeps };
