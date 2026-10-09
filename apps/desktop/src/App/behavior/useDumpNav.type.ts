/* @layer renderer-appshell @kind types */
interface DumpNavDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}

export type { DumpNavDeps };
