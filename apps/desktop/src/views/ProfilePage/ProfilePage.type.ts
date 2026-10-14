/* @layer renderer-components @kind types */
interface ProfilePageProps {
  profile: Profile;
  romStatus: RomDisplayInfo | null;
  isGameRunning: boolean;
  onStartGame: () => void;
  onDeleteProfile: () => void;
  onSwitchProfile: () => void;
}

interface ProfileDetailsProps {
  profile: Profile;
  assetsReady: boolean;
}

interface ProfileActionsProps {
  assetsReady: boolean;
  isGameRunning: boolean;
  onStartGame: () => void;
  onDeleteProfile: () => void;
  onSwitchProfile: () => void;
}

export type {
  ProfileActionsProps,
  ProfileDetailsProps,
  ProfilePageProps,
};
