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

interface ProfilePicksProps {
  profile: Profile;
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  onRefresh: () => void;
}

interface ProfileSettingsListProps {
  settings: Record<string, unknown>;
}

export type { ProfileDetailPanelProps, ProfilePicksProps, ProfileSettingsListProps };
