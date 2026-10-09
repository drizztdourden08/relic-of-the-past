/* @layer renderer-appshell @kind types */
interface SimRunDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}

export type { SimRunDeps };
