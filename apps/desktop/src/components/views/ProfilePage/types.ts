interface ProfilePageProps {
  profile: Profile;
  romStatus: RomDisplayInfo | null;
  isGameRunning: boolean;
  onStartGame: () => void;
  onDeleteProfile: () => void;
  onSwitchProfile: () => void;
}

export type {
  ProfilePageProps,
};
