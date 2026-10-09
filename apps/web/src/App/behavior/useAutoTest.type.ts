/* @layer renderer-appshell @kind types */
interface AutoTestDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}

export type { AutoTestDeps };
