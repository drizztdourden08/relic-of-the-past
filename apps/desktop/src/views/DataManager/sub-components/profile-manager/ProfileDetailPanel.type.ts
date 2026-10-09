/* @layer renderer-components @kind types */
interface ProfileDetailPanelProps {
  profile: Profile;
  settings: Record<string, unknown> | null;
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  isGameRunning: boolean;
  onSelectProfile: (profile: Profile) => void;
  onRefresh: () => void;
}

export type { ProfileDetailPanelProps };
